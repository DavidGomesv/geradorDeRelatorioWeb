// Gerador de Relatório Fotográfico - JavaScript

class RelatorioGenerator {
    constructor() {
        this.fotosAntes = [];
        this.fotosDepois = [];
        this.fotoPlaca = null;
        this.initializeEventListeners();
        this.setDefaultDate();
        this.loadFromStorage();
    }

    initializeEventListeners() {
        // Event listeners para upload de arquivos
        document.getElementById('fotosAntes').addEventListener('change', (e) => {
            this.handleFileUpload(e, 'antes');
        });

        document.getElementById('fotosDepois').addEventListener('change', (e) => {
            this.handleFileUpload(e, 'depois');
        });

        document.getElementById('fotoPlaca').addEventListener('change', (e) => {
            this.handleFileUpload(e, 'placa');
        });

        // Event listeners para salvar dados automaticamente
        ['siteId', 'dataExecucao', 'localizacao'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                // Converter siteId para maiúsculas automaticamente
                if (id === 'siteId') {
                    e.target.value = e.target.value.toUpperCase();
                }
                this.saveToStorage();
                this.updateGenerateButton();
            });
        });

        // Verificar se as bibliotecas carregaram
        this.checkLibraries();
    }

    checkLibraries() {
        // Não precisamos mais de bibliotecas externas
        this.showMessage('✅ Aplicação pronta para uso!', 'success');
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dataExecucao').value = today;
    }

    async handleFileUpload(event, tipo) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;

        this.showMessage(`📤 Carregando ${files.length} foto(s)...`, 'warning');

        try {
            for (let file of files) {
                if (!file.type.startsWith('image/')) {
                    continue;
                }

                const imageData = await this.processImage(file);
                
                switch (tipo) {
                    case 'antes':
                        this.fotosAntes.push(imageData);
                        break;
                    case 'depois':
                        this.fotosDepois.push(imageData);
                        break;
                    case 'placa':
                        this.fotoPlaca = imageData;
                        break;
                }
            }

            this.updatePreviews();
            this.updateStats();
            this.saveToStorage();
            this.updateGenerateButton();
            
            this.showMessage(`✅ ${files.length} foto(s) carregada(s) com sucesso!`, 'success');
            
        } catch (error) {
            console.error('Erro ao processar imagens:', error);
            this.showMessage('❌ Erro ao carregar fotos. Tente novamente.', 'error');
        }
    }

    async processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Redimensionar imagem para economizar memória
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calcular novo tamanho (máximo 800px na maior dimensão)
                    const maxSize = 800;
                    let { width, height } = img;
                    
                    if (width > height && width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Converter para base64
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    
                    resolve({
                        name: file.name,
                        dataUrl: dataUrl,
                        size: file.size,
                        type: file.type,
                        width: width,
                        height: height
                    });
                };
                
                img.onerror = reject;
                img.src = e.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    updatePreviews() {
        this.updatePreview('previewAntes', this.fotosAntes, 'antes');
        this.updatePreview('previewDepois', this.fotosDepois, 'depois');
        this.updatePreview('previewPlaca', this.fotoPlaca ? [this.fotoPlaca] : [], 'placa');
    }

    updatePreview(containerId, images, tipo) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        images.forEach((img, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            previewItem.innerHTML = `
                <img src="${img.dataUrl}" alt="${img.name}">
                <button class="remove-btn" onclick="app.removeImage('${tipo}', ${index})" title="Remover">×</button>
            `;
            
            container.appendChild(previewItem);
        });
    }

    removeImage(tipo, index) {
        switch (tipo) {
            case 'antes':
                this.fotosAntes.splice(index, 1);
                break;
            case 'depois':
                this.fotosDepois.splice(index, 1);
                break;
            case 'placa':
                this.fotoPlaca = null;
                break;
        }
        
        this.updatePreviews();
        this.updateStats();
        this.saveToStorage();
        this.updateGenerateButton();
        this.showMessage('🗑️ Foto removida', 'warning');
    }

    updateStats() {
        document.getElementById('countAntes').textContent = this.fotosAntes.length;
        document.getElementById('countDepois').textContent = this.fotosDepois.length;
        document.getElementById('countPlaca').textContent = this.fotoPlaca ? 1 : 0;
        
        const total = this.fotosAntes.length + this.fotosDepois.length + (this.fotoPlaca ? 1 : 0);
        document.getElementById('countTotal').textContent = total;
    }

    updateGenerateButton() {
        const siteId = document.getElementById('siteId').value.trim();
        const localizacao = document.getElementById('localizacao').value.trim();
        const temFotos = this.fotosAntes.length > 0 || this.fotosDepois.length > 0 || this.fotoPlaca;
        
        const btn = document.getElementById('generateBtn');
        btn.disabled = !siteId || !localizacao || !temFotos;
        
        if (btn.disabled) {
            btn.textContent = '⚠️ Preencha os dados e adicione fotos';
        } else {
            btn.textContent = '📄 Gerar Relatório DOCX';
        }
    }

    saveToStorage() {
        try {
            const data = {
                siteId: document.getElementById('siteId').value,
                dataExecucao: document.getElementById('dataExecucao').value,
                localizacao: document.getElementById('localizacao').value,
                fotosAntes: this.fotosAntes,
                fotosDepois: this.fotosDepois,
                fotoPlaca: this.fotoPlaca
            };
            
            localStorage.setItem('relatorioData', JSON.stringify(data));
        } catch (error) {
            console.warn('Erro ao salvar no localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('relatorioData') || '{}');
            
            if (data.siteId) document.getElementById('siteId').value = data.siteId;
            if (data.dataExecucao) document.getElementById('dataExecucao').value = data.dataExecucao;
            if (data.localizacao) document.getElementById('localizacao').value = data.localizacao;
            
            if (data.fotosAntes) this.fotosAntes = data.fotosAntes;
            if (data.fotosDepois) this.fotosDepois = data.fotosDepois;
            if (data.fotoPlaca) this.fotoPlaca = data.fotoPlaca;
            
            this.updatePreviews();
            this.updateStats();
            this.updateGenerateButton();
            
            if (data.siteId || data.localizacao || this.fotosAntes.length > 0) {
                this.showMessage('📁 Dados anteriores recuperados!', 'success');
            }
        } catch (error) {
            console.warn('Erro ao carregar do localStorage:', error);
        }
    }

    async generateReport() {
        const siteId = document.getElementById('siteId').value.trim();
        const dataExecucao = document.getElementById('dataExecucao').value;
        const localizacao = document.getElementById('localizacao').value.trim();

        // Mostrar loading
        document.getElementById('loading').style.display = 'block';
        document.getElementById('generateBtn').style.display = 'none';

        try {
            // Gerar arquivo HTML (compatível com Word)
            const htmlBlob = await this.generateWordHTMLReport(siteId, dataExecucao, localizacao);
            
            // Criar arquivo para download
            const fileName = `RLT_ZELADORIA_${siteId}_${dataExecucao}.doc`;
            
            // Download do arquivo
            const url = URL.createObjectURL(htmlBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('✅ Relatório .DOC gerado com sucesso! Compatível com Word.', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            this.showMessage('❌ Erro ao gerar relatório. Tente novamente.', 'error');
        } finally {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('generateBtn').style.display = 'block';
        }
    }

    async generateWordHTMLReport(siteId, dataExecucao, localizacao) {
        const dataFormatada = this.formatDate(dataExecucao);

        let htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word 15">
<meta name="Originator" content="Microsoft Word 15">
<!--[if !mso]>
<style>
v\\:* {behavior:url(#default#VML);}
o\\:* {behavior:url(#default#VML);}
w\\:* {behavior:url(#default#VML);}
.shape {behavior:url(#default#VML);}
</style>
<![endif]-->
<style>
@page {
    margin: 2cm;
}
body {
    font-family: "Times New Roman", serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #000;
}
h1 {
    text-align: center;
    font-size: 18pt;
    font-weight: bold;
    margin-bottom: 20pt;
    text-transform: uppercase;
}
h2 {
    font-size: 14pt;
    font-weight: bold;
    margin-top: 20pt;
    margin-bottom: 10pt;
    text-transform: uppercase;
}
.info-section {
    margin-bottom: 20pt;
}
.info-item {
    margin-bottom: 8pt;
    font-weight: bold;
}
.photo-list {
    margin-left: 20pt;
    margin-bottom: 15pt;
}
.photo-item {
    margin-bottom: 5pt;
}
.footer {
    margin-top: 30pt;
    font-style: italic;
    font-size: 10pt;
    text-align: center;
}
</style>
</head>
<body>

<h1>RELATÓRIO FOTOGRÁFICO DE ZELADORIA</h1>

<div class="info-section">
    <div class="info-item">Site ID: ${siteId}</div>
    <div class="info-item">Data da Execução: ${dataFormatada}</div>
    <div class="info-item">Localização: ${localizacao.toUpperCase()}</div>
</div>

${this.createWordHTMLPhotoSection("FOTOS - ANTES", this.fotosAntes)}
${this.createWordHTMLPhotoSection("FOTOS - DEPOIS", this.fotosDepois)}
${this.createWordHTMLPhotoSection("PLACA DE IDENTIFICAÇÃO", this.fotoPlaca ? [this.fotoPlaca] : [])}

<div class="footer">
    <p>Relatório gerado automaticamente pelo Sistema de Zeladoria</p>
</div>

</body>
</html>`;

        return new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    }

    createWordHTMLPhotoSection(titulo, fotos) {
        let sectionHTML = `<h2>${titulo}</h2>`;

        if (fotos.length === 0) {
            sectionHTML += '<p><i>Nenhuma foto adicionada para esta seção</i></p>';
        } else {
            sectionHTML += '<div class="photo-list">';
            fotos.forEach((foto, index) => {
                sectionHTML += `<div class="photo-item">Foto ${index + 1}: ${foto.name} (${foto.width}x${foto.height}px)</div>`;
            });
            sectionHTML += '</div>';
        }

        return sectionHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    showMessage(message, type) {
        const container = document.getElementById('statusMessage');
        container.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
        
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }

    clearAll() {
        if (confirm('🗑️ Tem certeza que deseja limpar todos os dados?')) {
            // Limpar dados
            this.fotosAntes = [];
            this.fotosDepois = [];
            this.fotoPlaca = null;
            
            // Limpar formulário
            document.getElementById('siteId').value = '';
            document.getElementById('localizacao').value = '';
            this.setDefaultDate();
            
            // Limpar inputs de arquivo
            document.getElementById('fotosAntes').value = '';
            document.getElementById('fotosDepois').value = '';
            document.getElementById('fotoPlaca').value = '';
            
            // Limpar localStorage
            localStorage.removeItem('relatorioData');
            
            // Atualizar interface
            this.updatePreviews();
            this.updateStats();
            this.updateGenerateButton();
            
            this.showMessage('🗑️ Todos os dados foram limpos!', 'warning');
        }
    }

    async shareReport() {
        const siteId = document.getElementById('siteId').value.trim();
        const dataExecucao = document.getElementById('dataExecucao').value;
        const localizacao = document.getElementById('localizacao').value.trim();

        if (!siteId || !localizacao) {
            this.showMessage('⚠️ Preencha os dados básicos antes de compartilhar', 'warning');
            return;
        }

        const totalFotos = this.fotosAntes.length + this.fotosDepois.length + (this.fotoPlaca ? 1 : 0);
        
        const message = `
📋 *RELATÓRIO ZELADORIA*

🆔 *Site:* ${siteId}
📅 *Data:* ${this.formatDate(dataExecucao)}
📍 *Local:* ${localizacao.toUpperCase()}
📸 *Fotos:* ${totalFotos} (${this.fotosAntes.length} antes, ${this.fotosDepois.length} depois, ${this.fotoPlaca ? 1 : 0} placa)

_Relatório gerado pelo app mobile de zeladoria_
        `.trim();

        // Tentar usar a API Web Share nativa do mobile
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Relatório Zeladoria - ${siteId}`,
                    text: message,
                });
                this.showMessage('✅ Compartilhado com sucesso!', 'success');
            } catch (error) {
                console.log('Compartilhamento cancelado pelo usuário');
            }
        } else {
            // Fallback para WhatsApp Web
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            this.showMessage('📱 Abrindo WhatsApp...', 'success');
        }
    }

    exportData() {
        try {
            const data = {
                siteId: document.getElementById('siteId').value,
                dataExecucao: document.getElementById('dataExecucao').value,
                localizacao: document.getElementById('localizacao').value,
                fotosAntes: this.fotosAntes,
                fotosDepois: this.fotosDepois,
                fotoPlaca: this.fotoPlaca,
                exportDate: new Date().toISOString(),
                version: '2.0'
            };

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const fileName = `backup_zeladoria_${data.siteId || 'dados'}_${new Date().toISOString().split('T')[0]}.json`;

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showMessage('💾 Backup salvo! Guarde este arquivo para restaurar os dados depois.', 'success');
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            this.showMessage('❌ Erro ao criar backup', 'error');
        }
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Restaurar dados
                if (data.siteId) document.getElementById('siteId').value = data.siteId;
                if (data.dataExecucao) document.getElementById('dataExecucao').value = data.dataExecucao;
                if (data.localizacao) document.getElementById('localizacao').value = data.localizacao;
                
                if (data.fotosAntes) this.fotosAntes = data.fotosAntes;
                if (data.fotosDepois) this.fotosDepois = data.fotosDepois;
                if (data.fotoPlaca) this.fotoPlaca = data.fotoPlaca;
                
                this.updatePreviews();
                this.updateStats();
                this.updateGenerateButton();
                this.saveToStorage();
                
                this.showMessage('📁 Backup restaurado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao importar dados:', error);
                this.showMessage('❌ Arquivo de backup inválido', 'error');
            }
        };
        
        reader.readAsText(file);
        // Limpar o input para permitir selecionar o mesmo arquivo novamente
        event.target.value = '';
    }
}

// Funções globais
function generateReport() {
    app.generateReport();
}

function shareReport() {
    app.shareReport();
}

function exportData() {
    app.exportData();
}

function clearAll() {
    app.clearAll();
}

// Inicializar aplicação
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new RelatorioGenerator();
});

// Service Worker para funcionamento offline
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
}