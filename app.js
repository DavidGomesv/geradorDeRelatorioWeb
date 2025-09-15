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
            btn.textContent = '🚀 Gerar Relatório';
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
            // Gerar HTML do relatório
            const htmlContent = await this.generateHTMLReport(siteId, dataExecucao, localizacao);
            
            // Criar arquivo HTML para download
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const fileName = `RLT_ZELADORIA_${siteId}_${dataExecucao}.html`;
            
            // Download do arquivo
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('✅ Relatório HTML gerado! Abra o arquivo e use "Imprimir > Salvar como PDF" para converter.', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            this.showMessage('❌ Erro ao gerar relatório. Tente novamente.', 'error');
        } finally {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('generateBtn').style.display = 'block';
        }
    }

    async generateHTMLReport(siteId, dataExecucao, localizacao) {
        const dataFormatada = this.formatDate(dataExecucao);
        
        let htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Zeladoria - ${siteId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 20px;
        }
        
        .header h1 {
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 5px solid #4CAF50;
        }
        
        .info-item {
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .info-label {
            font-weight: bold;
            color: #2c3e50;
            display: inline-block;
            width: 150px;
        }
        
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
            margin-bottom: 20px;
            text-transform: uppercase;
        }
        
        .photos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .photo-item {
            text-align: center;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 10px;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .photo-item img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            margin-bottom: 10px;
        }
        
        .photo-caption {
            font-size: 12px;
            color: #666;
            font-style: italic;
        }
        
        .no-photos {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        
        @media print {
            body {
                padding: 0;
                max-width: none;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .photos-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 768px) {
            .photos-grid {
                grid-template-columns: 1fr;
            }
            
            .info-label {
                width: 120px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório Fotográfico de Zeladoria</h1>
    </div>
    
    <div class="info-section">
        <div class="info-item">
            <span class="info-label">Site ID:</span>
            <span>${siteId}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Data da Execução:</span>
            <span>${dataFormatada}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Localização:</span>
            <span>${localizacao.toUpperCase()}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Data da Geração:</span>
            <span>${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</span>
        </div>
    </div>
`;

        // Adicionar seção de fotos ANTES
        htmlContent += this.createHTMLPhotoSection("FOTOS - ANTES", this.fotosAntes);
        
        // Adicionar seção de fotos DEPOIS
        htmlContent += this.createHTMLPhotoSection("FOTOS - DEPOIS", this.fotosDepois);
        
        // Adicionar seção da placa
        htmlContent += this.createHTMLPhotoSection("PLACA DE IDENTIFICAÇÃO", this.fotoPlaca ? [this.fotoPlaca] : []);

        htmlContent += `
    <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema de Zeladoria</p>
        <p>Para converter em PDF: Pressione Ctrl+P (ou Cmd+P no Mac) e selecione "Salvar como PDF"</p>
    </div>
</body>
</html>`;

        return htmlContent;
    }

    createHTMLPhotoSection(titulo, fotos) {
        let sectionHTML = `
    <div class="section">
        <h2 class="section-title">${titulo}</h2>`;

        if (fotos.length === 0) {
            sectionHTML += `
        <div class="no-photos">
            Nenhuma foto adicionada para esta seção
        </div>`;
        } else {
            sectionHTML += `
        <div class="photos-grid">`;

            fotos.forEach((foto, index) => {
                sectionHTML += `
            <div class="photo-item">
                <img src="${foto.dataUrl}" alt="${foto.name}">
                <div class="photo-caption">
                    ${foto.name}<br>
                    Dimensões: ${foto.width} x ${foto.height}px
                </div>
            </div>`;
            });

            sectionHTML += `
        </div>`;
        }

        sectionHTML += `
    </div>`;

        return sectionHTML;
    }

    // Manter função antiga para compatibilidade (não será usada)
    async createImageSection(titulo, imagens) {
        if (imagens.length === 0) return [];

        const elements = [];

        // Separador
        elements.push(new docx.Paragraph({
            children: [
                new docx.TextRun({
                    text: "------------------------------------------",
                    color: "666666"
                })
            ],
            spacing: { before: 400, after: 200 }
        }));

        // Título da seção
        elements.push(new docx.Paragraph({
            children: [
                new docx.TextRun({
                    text: titulo,
                    bold: true,
                    size: 24,
                    color: "000000"
                })
            ],
            spacing: { after: 300 }
        }));

        // Adicionar imagens
        for (let img of imagens) {
            try {
                // Converter dataURL para buffer
                const base64Data = img.dataUrl.split(',')[1];
                const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

                elements.push(new docx.Paragraph({
                    children: [
                        new docx.ImageRun({
                            data: buffer,
                            transformation: {
                                width: 400,
                                height: 300
                            }
                        })
                    ],
                    spacing: { after: 200 }
                }));
            } catch (error) {
                console.error('Erro ao adicionar imagem:', error);
            }
        }

        return elements;
    }

    generateReportFallback() {
        // Método alternativo caso as bibliotecas não carreguem
        const siteId = document.getElementById('siteId').value.trim();
        const dataExecucao = document.getElementById('dataExecucao').value;
        const localizacao = document.getElementById('localizacao').value.trim();

        let reportData = {
            siteId,
            dataExecucao: this.formatDate(dataExecucao),
            localizacao: localizacao.toUpperCase(),
            fotosAntes: this.fotosAntes.length,
            fotosDepois: this.fotosDepois.length,
            temPlaca: !!this.fotoPlaca
        };

        // Criar arquivo de texto com informações
        const textContent = `
RELATÓRIO FOTOGRÁFICO DE ZELADORIA
=====================================

Site ID: ${reportData.siteId}
Data da Execução: ${reportData.dataExecucao}
Localização: ${reportData.localizacao}

RESUMO DAS FOTOS:
- Fotos ANTES: ${reportData.fotosAntes}
- Fotos DEPOIS: ${reportData.fotosDepois}
- Foto da Placa: ${reportData.temPlaca ? 'Sim' : 'Não'}

NOTA: As fotos estão armazenadas localmente no navegador.
Para acessá-las, use a função "Exportar Fotos" no aplicativo.
        `;

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const fileName = `RLT. ZELADORIA - ${siteId} - ${dataExecucao}.txt`;
        
        // Fazer download manual
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('📄 Relatório de texto gerado! Acesse a versão completa para gerar .docx.', 'warning');
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