import axiosInstance from '@/lib/axios';

// ── Dashboard ──
export function getDashboardData() {
  return axiosInstance.get('/api/dashboard');
}

// ── Balance & Fund ──
export function fetchBalance() {
  return axiosInstance.get('/api/fund');
}
export function deposit(amount: number) {
  return axiosInstance.post('/api/fund', { amount });
}
export function withdraw(amount: number) {
  return axiosInstance.post('/api/withdraw', { amount });
}

// ── Trades ──
export function fetchOpenTrades() {
  return axiosInstance.get('/api/trade/open');
}
export function fetchTradeHistory() {
  return axiosInstance.get('/api/trade/history');
}
export function placeTrade(isUpPool: boolean, bettedBalance: number) {
  return axiosInstance.post('/api/trade', { isUpPool, bettedBalance });
}

// ── Price ──
export function fetchEthPrice() {
  return axiosInstance.get('/api/eth/price');
}

// ── Admin ──
export function overrideCandle(candleData: any) {
  return axiosInstance.post('/api/admin/override-candle', candleData);
}

// ── Auth ──
export function login(email: string, password: string) {
  return axiosInstance.post('/api/auth/login', { email, password });
}
export function register(email: string, password: string) {
  return axiosInstance.post('/api/auth/register', { email, password });
}

// ── User ──
export function getPlayer() {
  return axiosInstance.get('/api/user/me');
}

// ── Profile stubs ──
export function generateReferral() {
  return axiosInstance.post('/api/user/referral');
}
export function uploadAvatar(file: File) {
  const form = new FormData();
  form.append('avatar', file);
  return axiosInstance.post('/api/user/avatar', form);
}
export function updatePlayer(data: any) {
  return axiosInstance.put('/api/user', data);
}
export function userDisconnect() {
  return axiosInstance.post('/api/user/disconnect');
}

// ── Jackpot ──
export function getWeeklyJackpot(address: string) {
  return axiosInstance.get(`/api/jackpot/weekly?address=${address}`);
}
export function getMonthlyJackpot(address: string) {
  return axiosInstance.get(`/api/jackpot/monthly?address=${address}`);
}
export function getHistory() {
  return axiosInstance.get('/api/jackpot/history');
}
export function getWinnerHistory(page: number) {
  return axiosInstance.get(`/api/jackpot/winners?page=${page}`);
}

// ── Admin/Dev functions ──
export function getRecent(address: string, points: number) {
  return axiosInstance.post('/api/admin/set-points', { address, points });
}

// ── Leaderboard ──
export function getLeaderboardData(type: string) {
  return axiosInstance.get(`/api/leaderboard?type=${type}`);
}

// ── User Activity & Stats ──
export function getUserActivity(params?: {
  limit?: number;
  skip?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.skip) queryParams.append('skip', params.skip.toString());
  if (params?.type) queryParams.append('type', params.type);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.status) queryParams.append('status', params.status);

  return axiosInstance.get(`/api/user/activity?${queryParams.toString()}`);
}

export function getUserActivityStats(timeRange?: string) {
  return axiosInstance.get(`/api/user/activity/stats${timeRange ? `?timeRange=${timeRange}` : ''}`);
}

export function getUserTrades(params?: {
  limit?: number;
  skip?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.skip) queryParams.append('skip', params.skip.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  return axiosInstance.get(`/api/user/trades?${queryParams.toString()}`);
}

export function getUserBets(params?: {
  limit?: number;
  skip?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.skip) queryParams.append('skip', params.skip.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  return axiosInstance.get(`/api/user/bets?${queryParams.toString()}`);
}

export function getUserStats() {
  return axiosInstance.get('/api/user/stats');
}

export function logUserActivity(activityType: string, metadata?: any) {
  return axiosInstance.post('/api/user/activity', { activityType, metadata });
}

// ── Referral Reports ──
export function getReferralReport(page: number) {
  return axiosInstance.get(`/api/referral/report?page=${page}`);
}
