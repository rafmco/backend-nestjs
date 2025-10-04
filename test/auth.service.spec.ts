import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from '../src/user/entities/user.entity';
import { RefreshToken } from '../src/auth/entities/refreshToken.entity';

describe('AuthService Tests', () => {
  let authService: AuthService;

  // Mock do repositório
  const mockAuthRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockAuthRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(authService).toBeDefined();
  });
  // Testes básicos para signUp
  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthRepository.findOneBy.mockResolvedValue(null);
      mockAuthRepository.create.mockReturnValue({
        ...userData,
        id: 1,
        active: 'ACTIVE',
        createdAt: new Date(),
        password: 'hashedPassword',
        salt: 'salt',
      });
      mockAuthRepository.save.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        active: 'ACTIVE',
        createdAt: new Date(),
      });

      const result = await authService.signUp(
        userData.name,
        userData.email,
        userData.password,
      );

      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('salt');
      expect(mockAuthRepository.findOneBy).toHaveBeenCalledWith({
        email: userData.email,
      });
    });

    it('should throw error when email already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      mockAuthRepository.findOneBy.mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
      });

      await expect(
        authService.signUp(userData.name, userData.email, userData.password),
      ).rejects.toThrow();
    });
  });

  // Testes básicos para signIn
  describe('signIn', () => {
    it('should sign in successfully and return tokens', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      // const hash = (await scrypt(credentials.password, salt, 32)) as Buffer;
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password:
          '3a93b4eb403224aa21e377c7bbd8ea59222aaebfd917e482f64b0295ecb5c204', // 'mocked-hash' in hex (what the mock returns)
        salt: '6d6f636b65642d73616c74', // 'mocked-salt' in hex
        userGroupUsers: [{ userGroup: { name: 'Admin' } }],
      };

      mockAuthRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockRefreshTokenRepository.create.mockReturnValue({
        value: 'refresh-token',
        userId: 1,
        createdAt: new Date(),
      });
      mockRefreshTokenRepository.save.mockResolvedValue({});

      const result = await authService.signIn(
        credentials.email,
        credentials.password,
      );

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockAuthRepository.findOne).toHaveBeenCalledWith({
        where: { email: credentials.email },
        relations: ['userGroupUsers', 'userGroupUsers.userGroup'],
      });
    });

    it('should throw error when user not found', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockAuthRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.signIn(credentials.email, credentials.password),
      ).rejects.toThrow();
    });
  });

  // Testes básicos para refresh
  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'valid-refresh-token';

      const mockPayload = {
        sub: 1,
        username: 'test@example.com',
        type: 'refresh',
      };

      const mockStoredToken = {
        value: refreshToken,
        userId: 1,
        deletedAt: null,
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        userGroupUsers: [],
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockRefreshTokenRepository.findOneBy.mockResolvedValue(mockStoredToken);
      mockAuthRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await authService.refresh(refreshToken);

      expect(result).toHaveProperty('accesToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken);
    });

    it('should throw error when refresh token is invalid', async () => {
      const refreshToken = 'invalid-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refresh(refreshToken)).rejects.toThrow();
    });
  });
});
