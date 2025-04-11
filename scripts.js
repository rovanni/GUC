// Dados Iniciais (exemplo da planilha)
let ucs = [
    { codigo: "UC 01", descricao: "Insira a descrição da UC 01...", carga: 96, indicadores: 8 },
    { codigo: "UC 02", descricao: "Insira a descrição da UC 02...", carga: 48, indicadores: 6 },
    { codigo: "UC 03", descricao: "Insira a descrição da UC 03...", carga: 36, indicadores: 2 },
    { codigo: "UC 04", descricao: "Insira a descrição da UC 04...", carga: 20, indicadores: 1 }
];

// Função para atualizar a tabela
function atualizarTabela() {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = "";
    let totalCarga = 0, totalIndicadores = 0;

    ucs.forEach((uc, index) => {
        const diasUC = uc.carga / 4;
        const diasIndicador = diasUC / uc.indicadores;
        totalCarga += uc.carga;
        totalIndicadores += uc.indicadores;

        tbody.innerHTML += `
                    <tr>
                        <td>${uc.codigo}</td>
                        <td><input type="text" class="editable" value="${uc.descricao}" data-index="${index}" data-field="descricao"></td>
                        <td><input type="number" class="editable" value="${uc.carga}" data-index="${index}" data-field="carga"></td>
                        <td><input type="number" class="editable" value="${uc.indicadores}" data-index="${index}" data-field="indicadores"></td>
                        <td>${diasUC}</td>
                        <td>${diasIndicador.toFixed(2)}</td>
                        <td class="col-lixeira"><button onclick="removerUC(${index})"><i class="fas fa-trash"></i></button></td>
                    </tr>
                `;
    });

    document.getElementById("total-carga").textContent = totalCarga;
    document.getElementById("total-indicadores").textContent = totalIndicadores;
    atualizarGrafico();
}

// Edição em Tempo Real
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('editable')) {
        const index = e.target.dataset.index;
        const field = e.target.dataset.field;
        const value = field === 'carga' || field === 'indicadores' ? parseInt(e.target.value) : e.target.value;
        ucs[index][field] = value;
        atualizarTabela();
    }
});


// Adicionar Nova UC
document.getElementById("form-add-uc").addEventListener("submit", (e) => {
    e.preventDefault();
    const novaUC = {
        codigo: document.getElementById("codigo").value,
        descricao: document.getElementById("descricao").value,
        carga: parseInt(document.getElementById("carga").value),
        indicadores: parseInt(document.getElementById("indicadores").value)
    };
    ucs.push(novaUC);
    atualizarTabela();
    e.target.reset();
});

// Remover UC
function removerUC(index) {
    const confirmar = confirm("Tem certeza que deseja excluir?");
    if (confirmar) {
        // Remove o item da lista
        ucs.splice(index, 1);
        atualizarTabela(); // Atualiza a tabela após a remoção
    }
}


// Gráfico
let grafico;
function atualizarGrafico() {
    if (grafico) grafico.destroy();
    const ctx = document.getElementById('grafico-barras').getContext('2d');
    grafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ucs.map(uc => uc.codigo),
            datasets: [{
                label: 'Dias por UC',
                data: ucs.map(uc => uc.carga / 4),
                backgroundColor: '#3b82f6'
            }]
        }
    });
}


// Inicializar
atualizarTabela();
function exportarParaExcel() {
    const wsData = [
        ["UC", "Descrição", "Carga Horária", "Indicadores", "Dias/UC", "Dias/Indicador"],
        ...ucs.map(uc => [
            uc.codigo,
            uc.descricao,
            uc.carga,
            uc.indicadores,
            (uc.carga / 4).toFixed(2),
            (uc.carga / 4 / uc.indicadores).toFixed(2)
        ])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "UCs");
    XLSX.writeFile(wb, "ucs.xlsx");
}

function exportarParaPDF() {
    const doc = new jspdf.jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Unidades Curriculares", 15, 15);

    // Tabela
    const headers = [["UC", "Descrição", "Carga Horária", "Indicadores", "Dias/UC", "Dias/Indicador"]];
    const data = ucs.map(uc => [
        uc.codigo,
        uc.descricao,
        uc.carga.toString(),
        uc.indicadores.toString(),
        (uc.carga / 4).toFixed(2),
        (uc.carga / 4 / uc.indicadores).toFixed(2)
    ]);

    // Adicionar totais
    data.push([
        "TOTAL",
        "",
        ucs.reduce((a, b) => a + b.carga, 0).toString(),
        ucs.reduce((a, b) => a + b.indicadores, 0).toString(),
        "",
        ""
    ]);

    doc.autoTable({
        head: headers,
        body: data,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save("ucs.pdf");
}     