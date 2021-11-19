const json = 'https://arte.estadao.com.br/public/pages/w8/1q/03/e1/q7/zr/page.json';

document.write("<base href='https://" + document.location.host + "' />");

// -------------------------------------------------------------------------------------------------------------------------------------
//Função para posicionar o chapéu logo abaixo do menu fixo quando selecionado
function addMargin() {
    window.scrollTo(0, window.pageYOffset - 130);
}

window.addEventListener('hashchange', addMargin);

// -------------------------------------------------------------------------------------------------------------------------------------
//Função para abrir o menu
function abreMenu() {
    var abre = document.getElementById("hamburger");
    if (abre.style.display === "block") {
        abre.style.display = "none";
    } else {
        abre.style.display = "block";
    };

    //Troca o ícone
    var trocaIcone = document.getElementById("icone");
    trocaIcone.classList.toggle('fa-bars');
    trocaIcone.classList.toggle('fa-times');
};


// -------------------------------------------------------------------------------------------------------------------------------------
function renderizaGoogleDocs(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType('application/json');
    rawFile.open('GET', file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState == 4 && rawFile.status == '200') callback(rawFile.responseText);
    };
    rawFile.send(null);
};

// -------------------------------------------------------------------------------------------------------------------------------------
renderizaGoogleDocs(json, function (text) {
    var googleDocsData = JSON.parse(text);
    // ---------------------------------------------------------------------------------------------------------------------------------
    //Cria o cabeçalho <head> do HTML com os metadados
    var metadados = '';
    googleDocsData.cabeca.forEach(function (block) {
        switch (block.type) {
            case 'titulo':
                metadados += `<title>${block.value}</title>`;
                break;
            case 'data':
                metadados += `<meta property="article:published_time" content="${block.value}"></meta>`;
                break;
            case 'atualizacao':
                metadados += `<meta property="article:modified_time" content="${block.value}"></meta>`;
                break;
            case 'thumb':
                metadados += `<meta name="image" content="${block.value}"></meta>`;
                break;
            case 'linha_fina':
                metadados += `<meta name="description" content="${block.value}"></meta>`;
                break;
            case 'autor':
                metadados += `<meta name="byl" content="${block.value}"></meta>`;
                break;
            case 'palavras_chave':
                metadados += `<meta name="news_keywords" content="${block.value}"></meta>`;
                break;
        }
    });
    document.head.innerHTML = metadados + `
    <meta name="robots" content="noarchive">
    <meta http-equiv="Content-Language" content="pt">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" href="https://arte.estadao.com.br/share/favicon/favicon.ico">
    <meta name="msapplication-starturl" content="https://www.estadao.com.br">
    <link rel="stylesheet" href="https://arte.estadao.com.br/share/styles/fonts.min.css">
    <link rel="stylesheet" href="./css/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    `;

    // ---------------------------------------------------------------------------------------------------------------------------------
    //Primeira dobra: Título, linha fina, etc.
    var header = '';
    googleDocsData.cabeca.forEach(function (block) {
        switch (block.type) {
            case 'chapeu':
                header += `<div><h3>${block.value}</h3></div>`;
                break;
            case 'titulo':
                header += `<div><h1 class="titulo">${block.value}</h1></div>`;
                break;
            case 'linha_fina':
                header += `<div><p class="linha_fina">${block.value}</p></div>`;
                break;
            case 'procedencia':
                header += `<div class="assinatura"><p class="autor">${block.value}`;
                break;
            case 'data':
                header += `<p class="autor_descricao">${block.value}`;
                break;
            case 'atualizacao':
                header += `<span class="autor_descricao">${block.value}</span></p></div>`;
                break;
        }
    });
    document.getElementById('cabecalho').innerHTML = header;

    // ---------------------------------------------------------------------------------------------------------------------------------
    //Render do conteúdo 
    var conteudo = '';
    googleDocsData.conteudo.forEach(function (block) {
        switch (block.type) {
            // -------------------------------------------------------------------------------------------------------------------------
            default: // Insere os parágrafos na sequência
                var paragrafo = document.createElement('p');
                paragrafo.className = 'texto';
                paragrafo.innerHTML = block.value;
                document.getElementById('conteudo').appendChild(paragrafo);
                break;
                // ---------------------------------------------------------------------------------------------------------------------
            case 'chapeu': // Insere o título do chapéu
                var chapeu = document.createElement('h4');
                chapeu.className = 'chapeu';
                chapeu.id = block.value;
                chapeu.innerHTML = block.value;
                document.getElementById('conteudo').appendChild(chapeu);
                // ---------------------------------------------------------------------------------------------------------------------
                var menu = document.createElement('a');
                menu.className = 'hamburgerItem';
                menu.href = '#' + block.value;
                menu.setAttribute('onclick', 'abreMenu()');
                menu.innerHTML = block.value + '</br>';
                document.getElementById('hamburger').appendChild(menu);
                break;
                // ---------------------------------------------------------------------------------------------------------------------
            case 'titulinho': // Insere os subtítulos
                var titulinho = document.createElement('h2');
                titulinho.innerHTML = block.value;
                document.getElementById('conteudo').appendChild(titulinho);
                break;
                // ---------------------------------------------------------------------------------------------------------------------
            case 'lead': // Insere o lead da reportagem
                var paragrafo = document.createElement('p');
                paragrafo.className = 'lead';
                paragrafo.innerHTML = block.value;
                document.getElementById('conteudo').appendChild(paragrafo);
                break;
                // ---------------------------------------------------------------------------------------------------------------------
            case 'imagem': // Insere imagens
                var figure = document.createElement('figure');
                figure.setAttribute('data-contains', 'image');
                figure.className = block.value.tamanho;
                figure.innerHTML =
                    `<img 
                        src="./images/${block.value.fonte}"
                        loading="lazy" 
                        alt="${block.value.alt}">
                    <figcaption class="legenda">${block.value.legenda}
                        <span class="credito">${block.value.credito}</span>
                    </figcaption>`;
                document.getElementById('conteudo').appendChild(figure);
                break;
                // ---------------------------------------------------------------------------------------------------------------------
            case 'gráfico': // insere gráficos do Uva feitos no Illustrator
                function trocaBoolean() {
                    switch (block.value.mostrar_título) {
                        case 'sim':
                            return 'true';
                            break;
                        case 'não':
                            return 'false';
                            break;
                    }
                    switch (block.value.mostrar_descrição) {
                        case 'sim':
                            return 'true';
                            break;
                        case 'não':
                            return 'false';
                            break;
                    }
                    switch (block.value.mostrar_marca) {
                        case 'sim':
                            return 'true';
                            break;
                        case 'não':
                            return 'false';
                            break;
                    }
                };
                // ---------------------------------------------------------------------------------------------------------------------
                var div = document.createElement('div');
                div.setAttribute('data-contains', 'graphic');
                div.className = block.value.tamanho;
                var uvaId = block.value.fonte;
                var showTitle = trocaBoolean(block.value.mostrar_título);
                var showDescription = trocaBoolean(block.value.mostrar_descrição);
                var showBrand = trocaBoolean(block.value.mostrar_marca);
                var script = document.createElement('script');
                script.setAttribute('data-uva-id', uvaId);
                script.setAttribute('data-show-title', showTitle);
                script.setAttribute('data-show-description', showDescription);
                script.setAttribute('data-show-brand', showBrand);
                script.setAttribute('src', 'https://arte.estadao.com.br/uva/scripts/embed.min.js');
                div.appendChild(script);
                document.getElementById('conteudo').appendChild(div);
                break;
                // ---------------------------------------------------------------------------------------------------------------------
            case 'pdf': // insere PDFs
                var pdf = document.createElement('div');
                pdf.className = 'pdfContainer';
                pdf.innerHTML =
                    `<object alt="${block.value.alt}" 
                        class="pdf" 
                        data="./pdfs/${block.value.fonte}?#zoom=25&scrollbar=1&toolbar=1&navpanes=1" 
                        type="application/pdf">
                    </object>`;
                document.getElementById('conteudo').appendChild(pdf);
                break;
                // ---------------------------------------------------------------------------------------------------------------------
            case 'youtubeVideo': // insere vídeos do YouTube
                var youtubeVideo = document.createElement('figure');
                youtubeVideo.className = block.value.tamanho;
                youtubeVideo.innerHTML =
                    `<iframe
                        style="margin: 1rem 0 0.5rem 0" width="100%" height="338" 
                        src="https://www.youtube.com/embed/${block.value.fonte}" 
                        frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                    </iframe>
                    <figcaption class="legenda">${block.value.legenda}<span class="credito">${block.value.credito}</span></figcaption>`;
                document.getElementById('conteudo').appendChild(youtubeVideo);
                break;
                // ---------------------------------------------------------------------------------------------------------------------
            case 'separador': // insere separadores entre os blocos
                var separador = document.createElement('hr');
                separador.className = 'filete_duplo';
                document.getElementById('conteudo').appendChild(separador);
                break;
                // ---------------------------------------------------------------------------------------------------------------------
            case 'html': // Insere código HTMl customizado
                var html = document.createElement('div');
                html.innerHTML = block.value.código;
                document.getElementById('conteudo').appendChild(html);
                break;
                // ---------------------------------------------------------------------------------------------------------------------
            case 'rodape': // Insere o rodapé
                var paragrafo = document.createElement('p');
                paragrafo.className = 'rodape';
                paragrafo.innerHTML = block.value;
                document.getElementById('rodape').appendChild(paragrafo);
                break;
        }
    });
});