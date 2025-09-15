# 📱 Relatório Fotográfico de Zeladoria - WebApp Offline

Uma aplicação web **100% offline** para gerar relatórios fotográficos de zeladoria diretamente no celular.

## ✨ Características Principais

- 🔌 **Funciona 100% offline** - não precisa de internet após carregar
- 📱 **Otimizado para mobile** - interface touch-friendly
- 💾 **Salva automaticamente** - dados persistem no navegador
- 📄 **Gera documentos .docx** - compatível com Word
- 🚀 **Instalável como app** - Progressive Web App (PWA)
- 📸 **Redimensiona fotos** - economiza espaço e memória

## 🚀 Como Usar

### 1. **Primeira vez:**
1. Abra `index.html` no navegador do celular
2. O navegador irá baixar as bibliotecas necessárias
3. A aplicação estará pronta para uso offline

### 2. **Instalação como App (Recomendado):**
1. Abra no **Chrome** ou **Safari**
2. Toque no menu (⋮) → **"Adicionar à tela inicial"**
3. A aplicação será instalada como um app nativo
4. Use sempre pelo ícone na tela inicial

### 3. **Usando a aplicação:**
1. **Preencha os dados básicos** (salvos automaticamente)
2. **Adicione fotos** tocando nas áreas de upload
3. **Visualize** as fotos carregadas
4. **Gere o relatório** - arquivo .docx será baixado
5. **Limpe os dados** para começar novo relatório

## 📂 Estrutura dos Arquivos

```
webapp/
├── index.html          # Interface principal
├── app.js             # Lógica da aplicação
├── sw.js              # Service Worker (offline)
├── manifest.json      # Configuração PWA
└── README.md          # Este arquivo
```

## 🔧 Funcionalidades Técnicas

### **Geração de Documentos:**
- Usa biblioteca `docx.js` para criar arquivos Word
- Redimensiona imagens automaticamente
- Formato compatível com Microsoft Word

### **Armazenamento Local:**
- `localStorage` para dados do formulário
- Base64 para imagens (com compressão)
- Limpeza automática quando necessário

### **Funcionamento Offline:**
- Service Worker cache as bibliotecas
- Funciona sem conexão após primeira carga
- Fallback para arquivo de texto se bibliotecas falharem

## 📱 Compatibilidade

### **Navegadores Suportados:**
- ✅ Chrome Android 60+
- ✅ Safari iOS 12+
- ✅ Firefox Mobile 68+
- ✅ Samsung Internet 8+

### **Funcionalidades por Navegador:**
| Funcionalidade | Chrome | Safari | Firefox |
|----------------|--------|--------|---------|
| Upload de fotos | ✅ | ✅ | ✅ |
| Geração .docx | ✅ | ✅ | ✅ |
| Funcionamento offline | ✅ | ✅ | ✅ |
| Instalação PWA | ✅ | ✅ | ⚠️ |
| Acesso à câmera | ✅ | ✅ | ✅ |

## 🎯 Vantagens vs Streamlit

| Característica | WebApp Offline | Streamlit Cloud |
|----------------|----------------|-----------------|
| Funcionamento offline | ✅ | ❌ |
| Problemas de conexão | ❌ | ✅ |
| Perda de dados mobile | ❌ | ✅ |
| Instalação como app | ✅ | ❌ |
| Velocidade | ⚡ Instantâneo | 🐌 Depende da net |
| Hospedagem | 🆓 Grátis | 🆓 Grátis |

## 📝 Como Hospedar

### **Opção 1: Arquivo Local**
1. Baixe todos os arquivos da pasta `webapp/`
2. Abra `index.html` diretamente no navegador
3. Funciona imediatamente!

### **Opção 2: GitHub Pages (Recomendado)**
1. Suba os arquivos para um repositório GitHub
2. Ative GitHub Pages na pasta `webapp/`
3. Acesse via URL: `https://seuusuario.github.io/repo/webapp/`

### **Opção 3: Netlify/Vercel**
1. Conecte o repositório
2. Configure pasta `webapp/` como raiz
3. Deploy automático

## 🔒 Privacidade e Segurança

- 🔐 **Dados locais apenas** - nada é enviado para servidores
- 📱 **Funciona offline** - sem transmissão de dados
- 🗑️ **Controle total** - você pode limpar dados a qualquer momento
- 🔒 **Sem tracking** - aplicação não rastreia usuários

## 🐛 Solução de Problemas

### **Erro "bibliotecas não carregaram":**
- Conecte-se à internet na primeira vez
- Recarregue a página (F5)
- Limpe cache do navegador

### **Fotos não aparecem:**
- Verifique se são arquivos de imagem (jpg, png)
- Reduza o tamanho das fotos se muito grandes
- Tente uma foto por vez

### **Arquivo não baixa:**
- Verifique permissões de download
- Tente usar Chrome ao invés de outros navegadores
- Limpe dados e tente novamente

## 📋 Próximas Melhorias

- [ ] Biblioteca offline local (sem CDN)
- [ ] Compressão mais eficiente de imagens
- [ ] Templates de relatório customizáveis
- [ ] Backup automático em nuvem (opcional)
- [ ] Assinatura digital nos relatórios

## 🆘 Suporte

Se tiver problemas:
1. Verifique a compatibilidade do navegador
2. Tente recarregar a página
3. Limpe cache e dados do site
4. Use Chrome para melhor compatibilidade

---

**💡 Dica:** Para melhor experiência, instale como PWA e use sempre offline!