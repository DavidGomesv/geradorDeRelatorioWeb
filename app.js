// Gerador de Relatório Fotográfico - JavaScript
// Funciona 100% offline no navegador

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
            document.getElementById(id).addEventListener('input', () => {
                this.saveToStorage();
                this.updateGenerateButton();
            });
        });

        // Verificar se as bibliotecas carregaram
        this.checkLibraries();
    }

    checkLibraries() {
        setTimeout(() => {
            if (typeof docx === 'undefined' || typeof saveAs === 'undefined') {
                this.showMessage('⚠️ Modo offline detectado. Algumas funcionalidades podem estar limitadas.', 'warning');
                console.log('Bibliotecas não carregadas - modo offline');
            } else {
                this.showMessage('✅ Aplicação pronta para uso offline!', 'success');
            }
        }, 1000);
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
        if (typeof docx === 'undefined') {
            this.generateReportFallback();
            return;
        }

        const siteId = document.getElementById('siteId').value.trim();
        const dataExecucao = document.getElementById('dataExecucao').value;
        const localizacao = document.getElementById('localizacao').value.trim();

        // Mostrar loading
        document.getElementById('loading').style.display = 'block';
        document.getElementById('generateBtn').style.display = 'none';

        try {
            // Criar documento
            const doc = new docx.Document({
                creator: "Gerador de Relatório Zeladoria",
                title: `Relatório Zeladoria - ${siteId}`,
                description: "Relatório fotográfico de zeladoria gerado offline",
                sections: [{
                    properties: {},
                    children: [
                        // Título principal
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "RELATÓRIO FOTOGRÁFICO DE ZELADORIA",
                                    bold: true,
                                    size: 32,
                                    color: "000000"
                                })
                            ],
                            alignment: docx.AlignmentType.CENTER,
                            spacing: { after: 400 }
                        }),

                        // Informações básicas
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: `Site ID: ${siteId}`,
                                    bold: true
                                })
                            ],
                            spacing: { after: 200 }
                        }),

                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: `Data da Execução: ${this.formatDate(dataExecucao)}`,
                                    bold: true
                                })
                            ],
                            spacing: { after: 200 }
                        }),

                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: `Localização: ${localizacao.toUpperCase()}`,
                                    bold: true
                                })
                            ],
                            spacing: { after: 400 }
                        }),

                        // Adicionar fotos ANTES
                        ...await this.createImageSection("FOTOS - ANTES", this.fotosAntes),

                        // Adicionar fotos DEPOIS  
                        ...await this.createImageSection("FOTOS - DEPOIS", this.fotosDepois),

                        // Adicionar foto da placa
                        ...await this.createImageSection("PLACA DE IDENTIFICAÇÃO", this.fotoPlaca ? [this.fotoPlaca] : [])
                    ]
                }]
            });

            // Gerar e baixar arquivo
            const blob = await docx.Packer.toBlob(doc);
            const fileName = `RLT. ZELADORIA - ${siteId} - ${dataExecucao}.docx`;
            
            saveAs(blob, fileName);
            
            this.showMessage('✅ Relatório gerado e baixado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            this.showMessage('❌ Erro ao gerar relatório. Tentando método alternativo...', 'error');
            this.generateReportFallback();
        } finally {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('generateBtn').style.display = 'block';
        }
    }

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

        this.showMessage('📄 Relatório de texto gerado! Use a versão online para gerar .docx completo.', 'warning');
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
}

// Funções globais
function generateReport() {
    app.generateReport();
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