import { CacheService } from "../../src/services/cache.service";
import { getRedisClient } from "../../src/config/redis";

jest.mock("../../src/config/redis");

describe("CacheService", () => {
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = {
      isOpen: true,
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    (getRedisClient as jest.Mock).mockReturnValue(mockRedis);
  });

  it("should get data from cache if open", async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify({ test: true }));
    const data = await CacheService.getTasksCache("user123");
    expect(data).toEqual({ test: true });
    expect(mockRedis.get).toHaveBeenCalled();
  });

  it("should return null if cache is closed", async () => {
    mockRedis.isOpen = false;
    const data = await CacheService.getTasksCache("user123");
    expect(data).toBeNull();
  });

  it("should set data in cache", async () => {
    await CacheService.setTasksCache("user123", { data: [] });
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it("should invalidate cache", async () => {
    await CacheService.invalidateTasksCache("user123");
    expect(mockRedis.del).toHaveBeenCalled();
  });
});
