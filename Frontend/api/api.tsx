import axios from 'axios';

// Cria a instância do Axios com a baseURL configurada
const api = axios.create({
  baseURL: 'http://localhost:3000', // Ajuste conforme necessário
});

// Interceptor de requisição para adicionar o token JWT no cabeçalho
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Obtém o token do localStorage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Adiciona o token no cabeçalho Authorization
  }
  return config;
}, (error) => {
  return Promise.reject(error); // Retorna erro se houver
});

// Interceptor de resposta para lidar com token expirado e renovação
api.interceptors.response.use(
  response => response, // Se a resposta for bem-sucedida, simplesmente retorna
  async (error) => {
    const originalRequest = error.config;

    // Verifica se o erro é 401 e se a mensagem de erro é 'Token expirado'
    if (error.response?.status === 401 && error.response?.data?.error === 'Token expirado') {
      try {
        // Pega o refresh token do localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Se não houver refresh token, redireciona para a página de login
          alert('Sua sessão expirou. Faça login novamente.');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Faz a requisição para renovar o token com o refresh token
        const { data } = await api.post('/refresh-token', { refreshToken });

        // Atualiza o token no localStorage
        localStorage.setItem('token', data.token);

        // Atualiza o cabeçalho Authorization com o novo token e tenta a requisição original
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
        return api(originalRequest); // Reenvia a requisição original com o novo token
      } catch (refreshError) {
        console.error('Erro ao renovar o token:', refreshError);
        // Redireciona para a página de login se não for possível renovar o token
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // Se não for erro de token expirado, simplesmente rejeita o erro
  }
);

export default api;
