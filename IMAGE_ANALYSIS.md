# 🖼️ Análise de Imagens de ECG

## O que foi adicionado

O ECG Analyzer agora suporta **upload e análise de imagens de ECG** nos formatos:
- PNG
- JPG / JPEG  
- BMP

## Como Funciona

### 1. Upload de Imagem
1. Vá para a página "Analisador"
2. Clique na seção "🖼️ Imagem de ECG"
3. Faça upload ou arraste uma imagem de ECG

### 2. Processamento
O sistema processa a imagem através de:

```
Imagem Original
     ↓
Carregar no Canvas
     ↓
Extrair Dados de Pixels (RGB → Escala de Cinza)
     ↓
Extrair Linha do Traço de ECG (do centro da imagem)
     ↓
Resample para 250 pontos/segundo
     ↓
Aplicar Filtro Suave (reduzir ruído)
     ↓
Dados ECG Numéricos
     ↓
Análise e Diagnóstico
```

### 3. Visualização
- **Pré-visualização:** Imagem original em escala
- **Visualização Completa:** Modal com imagem em tamanho real
- **Gráfico:** Traçado extraído visualizado como gráfico interativo

## Componentes Criados

### `ImagePreview.jsx`
Componente para exibição de imagens com:
- Visualização em miniatura
- Botão para tamanho completo
- Modal para visualização em tela cheia
- Opção de limpar/trocar arquivo

### Atualizado: `Analyzer.jsx`
- Suporte para importar `ImagePreview`
- Lógica para processar imagens
- Interface com 3 colunas (Dados, Imagem, Simulado)

### Atualizado: `api.js`
Função `extractECGFromImage()` que:
- Lê arquivo de imagem
- Converte para Canvas
- Extrai dados de pixel
- Processa e normaliza dados
- Retorna ECG numérico

### Atualizado: `FileUpload.jsx`
- Adicionados formatos de imagem (.png, .jpg, .jpeg, .bmp)
- Validação de tipo MIME para imagens

## Fluxo Técnico

```javascript
// No componente Analyzer
const extractedData = await extractECGFromImage(file)

// Em api.js
export const extractECGFromImage = async (imageFile) => {
  // 1. Ler arquivo como Data URL
  // 2. Criar elemento Image e carregar
  // 3. Desenhar em Canvas
  // 4. Extrair imageData dos pixels
  // 5. Processar e normalizar
  // 6. Retornar dados ECG
}
```

## Dados Retornados

```javascript
{
  data: [0.05, -0.2, 0.8, ...],     // Array de voltagens
  samplingRate: 250,                 // Hz
  duration: 10.5,                    // segundos
  source: "filename.png"             // Nome do arquivo
}
```

## Limitações e Considerações

1. **Resolução**: Quanto maior a resolução da imagem, melhor o resultado
2. **Contraste**: Imagens com bom contraste (fundo branco, traço preto) funcionam melhor
3. **Orientação**: Imagem deve estar em orientação normal (paisagem)
4. **Processamento Local**: Todo o processamento ocorre no navegador
5. **Performance**: Imagens muito grandes podem ser mais lentas

## Exemplos de Casos de Uso

✅ Upload de screenshot de equipamento médico  
✅ Análise de impressões de ECG antigas  
✅ Processamento de ECG capturado por câmera  
✅ Integração com sistemas legados que geram imagens  

## Futuros Melhoramentos

- [ ] Melhorar algoritmo de OCR com visão computacional avançada
- [ ] Suporte para múltiplas derivações (atualmente extrai 1 linha)
- [ ] Detecção automática de eixo do ECG
- [ ] Reconhecimento de papel milimetrado
- [ ] Correção de rotação automática
- [ ] Processamento com TensorFlow.js para ML local

## Formatos Suportados no Upload

| Tipo | Extensão | Descrição |
|------|----------|-----------|
| Dados | .csv | Dados em formato CSV |
| Dados | .json | Dados estruturados JSON |
| Dados | .ecg | Formato ECG proprietário |
| Imagem | .png | Imagem PNG (recomendado) |
| Imagem | .jpg | Imagem JPEG |
| Imagem | .jpeg | Imagem JPEG |
| Imagem | .bmp | Imagem BMP |

## Tecnologia

- **Canvas API**: Para processamento de imagem
- **FileReader API**: Para leitura de arquivo
- **Image Processing**: Extração de pixel e normalização customizada

---

**Versão:** 1.1.0  
**Data:** 28/04/2026
