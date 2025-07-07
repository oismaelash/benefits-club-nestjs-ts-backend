import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokens = {
    access_token: 'access_token_123',
    refresh_token: 'refresh_token_123',
    user: {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            validateUser: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);
      configService.get.mockReturnValueOnce('jwt_secret')
        .mockReturnValueOnce('24h')
        .mockReturnValueOnce('jwt_refresh_secret')
        .mockReturnValueOnce('7d');
      jwtService.sign.mockReturnValueOnce('access_token_123')
        .mockReturnValueOnce('refresh_token_123');

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        new UnauthorizedException('User already exists')
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      usersService.validateUser.mockResolvedValue(mockUser as any);
      configService.get.mockReturnValueOnce('jwt_secret')
        .mockReturnValueOnce('24h')
        .mockReturnValueOnce('jwt_refresh_secret')
        .mockReturnValueOnce('7d');
      jwtService.sign.mockReturnValueOnce('access_token_123')
        .mockReturnValueOnce('refresh_token_123');

      const result = await service.login(loginDto);

      expect(usersService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersService.validateUser.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'refresh_token_123',
    };

    it('should refresh token successfully', async () => {
      const mockPayload = { sub: 'user123', email: 'test@example.com' };
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findOne.mockResolvedValue(mockUser as any);
      configService.get.mockReturnValueOnce('jwt_refresh_secret')
        .mockReturnValueOnce('jwt_secret')
        .mockReturnValueOnce('24h')
        .mockReturnValueOnce('jwt_refresh_secret')
        .mockReturnValueOnce('7d');
      jwtService.sign.mockReturnValueOnce('new_access_token')
        .mockReturnValueOnce('new_refresh_token');

      const result = await service.refreshToken(refreshTokenDto);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken, {
        secret: 'jwt_refresh_secret',
      });
      expect(usersService.findOne).toHaveBeenCalledWith('user123');
      expect(result.access_token).toBe('new_access_token');
      expect(result.refresh_token).toBe('new_refresh_token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token')
      );
    });
  });

  describe('logout', () => {
    it('should return logout success message', async () => {
      const result = await service.logout();

      expect(result).toEqual({
        message: 'Logout successful',
      });
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      configService.get.mockReturnValueOnce('jwt_secret')
        .mockReturnValueOnce('24h')
        .mockReturnValueOnce('jwt_refresh_secret')
        .mockReturnValueOnce('7d');
      jwtService.sign.mockReturnValueOnce('access_token_123')
        .mockReturnValueOnce('refresh_token_123');

      const result = await service['generateTokens'](mockUser);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockTokens);
    });
  });
}); 