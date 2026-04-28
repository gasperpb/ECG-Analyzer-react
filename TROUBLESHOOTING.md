# 🔧 Troubleshooting - Erro ao Analisar ECG

## ⚠️ Erro: "Erro ao analisar ECG"

### Possíveis Causas e Soluções

#### 1️⃣ **Backend Não está Rodando**

**Sintoma:** Erro "Erro ao analisar ECG" e aviso "Backend não disponível"

**Solução:**
```bash
# Em outra janela terminal, navegue para o projeto Backend
cd path/to/ECG-Analyzer

# Inicie o backend
mvn spring-boot:run

# Verifique se está rodando
curl http://localhost:8080/api/ecg/status
```

**Verificação:** Abra http://localhost:8080 no navegador. Se nada carregar, o backend não está rodando.

---

#### 2️⃣ **Porta 8080 em Uso**

**Sintoma:** Backend não inicia ou falha na porta 8080

**Solução:**
```bash
# Windows - Find process using port 8080
netstat -ano | findstr :8080

# Kill process (substitua PID)
taskkill /PID <PID> /F

# Ou use porta diferente no application.properties do backend
server.port=8081
```

**Se usar porta diferente:** Atualize `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8081',  // ← Mude aqui
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/api')
  }
}
```

---

#### 3️⃣ **CORS (Cross-Origin) Error**

**Sintoma:** Erro no console: "CORS policy blocked"

**Solução:** Adicione CORS no Backend Java (Spring Boot)

Crie `CorsConfig.java`:
```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*");
    }
}
```

---

#### 4️⃣ **Dados Inválidos**

**Sintoma:** Erro "Dados de ECG vazios ou inválidos"

**Solução:**
- ✅ Use arquivo CSV com ao menos 250 pontos
- ✅ Use arquivo JSON com estrutura correta
- ✅ Verifique se valores são números válidos
- ✅ Tente primeiro com "Dados Simulados"

**Teste com JSON válido:**
```json
{
  "samplingRate": 250,
  "duration": 10,
  "data": [0.1, 0.2, 0.15, -0.1, 0.05, ...]
}
```

---

#### 5️⃣ **Timeout na Requisição**

**Sintoma:** Erro após longo tempo de espera

**Solução:** Aumentar timeout no `api.js`:

```javascript
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,  // ← Aumentar de 30s para 60s
  headers: {
    'Content-Type': 'application/json'
  }
})
```

---

## 🔍 Como Debugar

### 1. Abra o Console do Navegador
- **Chrome/Firefox:** Pressione `F12`
- **Aba:** Console
- **Procure por:** Mensagens vermelhas ou alaranjadas

### 2. Verifique a Requisição (Network Tab)
- **Aba:** Network
- **Faça uma análise**
- **Procure por:** POST request para `/api/ecg/analyze`
- **Verifique:** Status (200 OK vs erro)
- **Veja:** Response (dados retornados)

### 3. Teste a API Diretamente
```bash
# Terminal - Teste POST
curl -X POST http://localhost:8080/api/ecg/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "samplingRate": 250,
    "duration": 10,
    "data": [0.1, 0.2, 0.15, -0.1, 0.05]
  }'

# Esperado: JSON com resultados ou erro claro
```

---

## 📋 Checklist de Resolução

- [ ] Backend Java rodando em http://localhost:8080
- [ ] Nenhum erro no Console (F12)
- [ ] Network requests retornam status 200
- [ ] API responde ao `curl` diretamente
- [ ] Dados ECG válidos (array de números)
- [ ] CORS configurado no Backend
- [ ] Porta 8080 não está em conflito
- [ ] React app em http://localhost:3000

---

## 🚀 Se Tudo Falhar

### Fallback Automático
Se o backend não responder, o sistema automaticamente:
1. ✅ Tenta conectar com backend
2. ⚠️ Se falhar, exibe aviso
3. ⏭️ Gera análise simulada como exemplo
4. 💡 Aconselha verificar backend

### Análise Simulada
Quando backend não responde, você ainda pode:
- ✅ Ver gráfico do ECG
- ✅ Ver diagnóstico de exemplo
- ✅ Entender o fluxo
- ❌ Não é análise real

---

## 📞 Mais Informações

Veja também:
- [README.md](README.md) - Instalação e setup
- [DEVELOPMENT.md](DEVELOPMENT.md) - Arquitetura
- [IMAGE_ANALYSIS.md](IMAGE_ANALYSIS.md) - Análise de imagens

---

## 💡 Dicas Finais

1. **Sempre comece com dados simulados** para testar o fluxo
2. **Verifique o console** (F12) para mensagens detalhadas
3. **Backend deve estar rodando** antes de analisar dados reais
4. **Use curl ou Postman** para testar API diretamente
5. **Reinicie tudo** se trocar porta ou config

---

**Última atualização:** 28/04/2026  
**Versão:** 1.1.0
