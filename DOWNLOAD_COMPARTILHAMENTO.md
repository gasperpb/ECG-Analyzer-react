# 📥 Download e Compartilhamento de Relatórios

## Visão Geral

A funcionalidade de download e compartilhamento permite que usuários baixem relatórios em PDF e compartilhem resultados de análise ECG através de múltiplos canais.

---

## 🎯 Funcionalidades Implementadas

### 1. Download em PDF
Converte os resultados da análise em um documento PDF bem formatado.

**Características:**
- 📄 Relatório completo com todas as análises
- 📊 Métricas principais em tabela
- 💊 Sinais vitais (quando disponíveis)
- 📋 Diagnósticos identificados
- 🔧 Detalhes técnicos
- ⚠️ Aviso legal/responsabilidade médica
- 🎨 Formatação profissional com cores

**Como usar:**
1. Na página de resultados, clique no botão **"PDF"**
2. Aguarde a geração do arquivo
3. O PDF será baixado automaticamente como: `ECG_Relatorio_YYYY-MM-DD.pdf`

---

### 2. Compartilhamento de Link
Gera um link compartilhável que codifica os dados da análise.

**Características:**
- 🔗 Link com dados codificados em Base64
- 📧 Fácil de compartilhar via email/chat
- 🔐 Dados inclusos no próprio link
- 📱 Funciona em qualquer dispositivo

**Como usar:**
1. Clique no botão **"Compartilhar"**
2. Na aba **"Link"**, clique **"Copiar Link"**
3. O link foi copiado para a clipboard
4. Cole em emails, chats, redes sociais, etc.

**Exemplo de link:**
```
http://localhost:3002/?shared=eyJiY...
```

---

### 3. Resumo em Texto
Cria um resumo formatado em texto para compartilhamento direto.

**Características:**
- 📝 Texto bem estruturado com emojis
- 📊 Inclui métricas, diagnósticos, data
- ⚠️ Aviso sobre consulta médica
- ✂️ Pronto para copiar/colar

**Como usar:**
1. Clique no botão **"Compartilhar"**
2. Vá para a aba **"Resumo"**
3. Clique **"Copiar Resumo"**
4. Cole em mensagens, emails, documentos

**Exemplo de resumo:**
```
🏥 ECG Analyzer - Resumo da Análise

📊 Métricas Principais:
  • Frequência Cardíaca: 74 BPM
  • Ritmo: Sinusal Normal
  • QT: 400 ms
  • PR: 160 ms

💊 Sinais Vitais:
  • SpO₂: 98%
  • Glicose: 95 mg/dL
  • Pressão: 120/80 mmHg

📋 Diagnósticos (1):
  • Ritmo Sinusal Normal

Data: 28/04/2026
⚠️ Este é um resumo automático. Consulte um médico para avaliação completa.
```

---

### 4. Compartilhamento via Apps
Integra com aplicativos populares para compartilhamento rápido.

**Opções disponíveis:**

#### WhatsApp
- 💬 Abre o WhatsApp Web com o resumo formatado
- 📱 Selecione contato e envie
- ✅ Ideal para compartilhar com médicos/pacientes

**Como usar:**
1. Clique **"Compartilhar"**
2. Vá para a aba **"Apps"**
3. Clique **"WhatsApp"**
4. Selecione o contato e envie

#### Email
- 📧 Abre o cliente de email padrão
- 📋 Pré-preenchido com assunto e corpo
- ✉️ Pronto para enviar

**Como usar:**
1. Clique **"Compartilhar"**
2. Vá para a aba **"Apps"**
3. Clique **"Email"**
4. Seu cliente de email abre
5. Selecione destinatário e envie

---

## 📋 Conteúdo do Relatório PDF

O PDF gerado contém:

### Cabeçalho
```
🏥 ECG Analyzer - Relatório de Análise
Relatório gerado em [DATA e HORA]
```

### Seções
1. **Métricas Principais**
   - Frequência Cardíaca (BPM)
   - Ritmo (Normal, Anormal, etc)
   - Intervalo QT (ms)
   - Intervalo PR (ms)

2. **Sinais Vitais** (se fornecidos)
   - SpO₂ (%)
   - Glicose (mg/dL)
   - Pressão Arterial (mmHg)
   - Temperatura (°C)
   - Frequência Respiratória (bpm)
   - Hemoglobina (g/dL)
   - Tipo Sanguíneo

3. **Nível de Risco Geral**
   - 🔴 Crítico / 🟡 Atenção / 🟢 Normal

4. **Diagnósticos Identificados**
   - Nome do diagnóstico
   - Descrição
   - Recomendação

5. **Interpretação Clínica**
   - Análise textual completa

6. **Recomendações**
   - Lista de ações recomendadas

7. **Detalhes Técnicos**
   - Taxa de Amostragem (Hz)
   - Duração (s)
   - Total de Pontos
   - Data da Análise

8. **Aviso Legal**
   - Para fins educacionais/referência
   - Não substitui avaliação médica profissional

---

## 🛠️ Arquitetura Técnica

### Serviço: `src/services/shareService.js`

Funções principais:

#### `generatePDF(data)`
- Cria HTML formatado dos resultados
- Configura opções do PDF
- Dispara download automático
- **Retorno:** Boolean

#### `generateShareLink(data)`
- Converte dados para JSON
- Codifica em Base64
- Gera URL com parâmetro `shared`
- **Retorno:** String (URL)

#### `copyShareLink(data)`
- Gera o link via `generateShareLink()`
- Copia para clipboard (Clipboard API ou fallback)
- **Retorno:** Promise<String>

#### `copyShareText(data)`
- Gera resumo formatado
- Copia para clipboard
- **Retorno:** Promise<String>

#### `generateSummaryText(data)`
- Formata dados em texto estruturado
- Inclui emojis e indentação
- **Retorno:** String

#### `shareViaWebShare(data, title)`
- Usa Web Share API (dispositivos suportados)
- Compartilha com aplicativos do sistema
- **Retorno:** Promise<Boolean>

### Componente: `src/components/ShareModal.jsx`

Modal com 3 abas:

**Aba Link:**
- Copia o link compartilhável
- Mostra preview do URL
- Feedback visual "Copiado!"

**Aba Resumo:**
- Copia o resumo em texto
- Exibe conteúdo pré-formatado
- Dica de uso

**Aba Apps:**
- Botões para WhatsApp e Email
- Usa integrações de protocolos (wa.me, mailto:)
- Fallback para Web Share API se disponível

---

## 🔒 Segurança e Privacidade

### Dados Compartilhados
- ✅ Métricas de ECG
- ✅ Sinais Vitais
- ✅ Diagnósticos e Recomendações
- ✅ Detalhes Técnicos
- ❌ **NÃO** inclui dados de login/autenticação

### Codificação
- Base64 para link compartilhável
- Sem criptografia forte (não é sensível como senha)
- Dados visíveis quando descodificados
- Recomenda-se usar HTTPS em produção

### Considerações
- Dados inclusos na URL podem ser vistos em histórico de browser
- Links são permanentes (dados ficam armazenados na URL)
- Para segurança máxima, usar apenas canais seguros (HTTPS, apps privadas)

---

## 📱 Compatibilidade

### Navegadores
- ✅ Chrome/Chromium (todas as versões recentes)
- ✅ Firefox (todas as versões recentes)
- ✅ Safari (macOS/iOS 13+)
- ✅ Edge (todas as versões recentes)

### Dispositivos
- 💻 Desktop/Laptop
- 📱 Tablet
- 📞 Smartphone

### Funcionalidades por Navegador
| Funcionalidade | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| PDF | ✅ | ✅ | ✅ | ✅ |
| Copy Link | ✅ | ✅ | ✅ | ✅ |
| Copy Text | ✅ | ✅ | ✅ | ✅ |
| Web Share API | ✅ (54+) | ❌ | ✅ (13+) | ✅ (79+) |
| WhatsApp | ✅ | ✅ | ✅ | ✅ |
| Email | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Dependências

Bibliotecas instaladas:

```json
{
  "html2pdf.js": "^0.10.1",
  "qrcode.react": "^3.1.0"
}
```

**html2pdf.js**
- Gera PDFs no navegador
- Converte HTML → PDF
- Sem servidor necessário

**qrcode.react**
- Renderiza códigos QR
- Pode ser usado para compartilhamento visual
- Atualmente não integrado, disponível para expansão futura

---

## 📝 Exemplos de Uso

### Cenário 1: Paciente quer levar relatório ao médico
1. Clique em "PDF"
2. Arquivo baixa automaticamente
3. Leve no smartphone/tablet ou imprima

### Cenário 2: Médico compartilha resultado com paciente
1. Clique em "Compartilhar"
2. Aba "WhatsApp"
3. Selecione paciente
4. Envie

### Cenário 3: Profissional quer documentar resultado
1. Clique em "Compartilhar"
2. Aba "Email"
3. Envie para seu email pessoal/profissional

### Cenário 4: Compartilhar em grupo de profissionais
1. Clique em "Compartilhar"
2. Aba "Resumo" → "Copiar Resumo"
3. Cole em grupo do WhatsApp/Telegram/Email

---

## 🐛 Troubleshooting

### PDF não baixa
- ✅ Verifique permissões de download do navegador
- ✅ Tente novamente em outro navegador
- ✅ Limpe cache do navegador

### Link não copia
- ✅ Verifique permissões de clipboard
- ✅ Recarregue a página
- ✅ Tente em outro navegador

### Email não abre
- ✅ Certifique-se de ter cliente de email configurado
- ✅ Use mailto: manualmente: `mailto:?subject=Relatório ECG&body=...`

### WhatsApp não abre
- ✅ WhatsApp Web deve estar logado
- ✅ Ou instale WhatsApp Desktop
- ✅ Copie o resumo e envie manualmente

---

## 🔄 Roadmap Futuro

Melhorias planejadas:

- [ ] Gerar código QR para compartilhamento rápido
- [ ] Envio de PDF direto para email (servidor)
- [ ] Integração com Google Drive/OneDrive
- [ ] Histórico de compartilhamentos
- [ ] Assinatura digital do relatório
- [ ] Criptografia de link compartilhável
- [ ] Integração com plataformas de telemedicina
- [ ] API para integração com EMR/EHR systems

---

## 📞 Suporte

Para questões sobre a funcionalidade de compartilhamento:
1. Verifique este documento
2. Consulte TROUBLESHOOTING.md
3. Verifique console do navegador (F12) para erros

---

**Última atualização:** 28/04/2026
**Versão:** 1.0
**Status:** ✅ Completo e Testado
