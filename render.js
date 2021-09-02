function renderizarGoogleDocs(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType('application/json');
    rawFile.open('GET', file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState == 4 && rawFile.status == '200') callback(rawFile.responseText);
    };
    rawFile.send(null);
};

renderizarGoogleDocs('https://arte.estadao.com.br/public/pages/w8/1q/03/e1/q7/zr/page.json', function (text) {
    var jsonData = JSON.parse(text);

    //Cria o cabeçalho <head> do HTML com os metadados
    var metadados = '';
    jsonData.cabeca.forEach(function (block) {
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
    <link rel="stylesheet" href="design_system.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="https://cdn.jsdelivr.net/npm/lazyload@2.0.0-rc.2/lazyload.js"></script>`;

    //Primeira dobra: Título, linha fina, etc.
    var header = '';
    jsonData.cabeca.forEach(function (block) {
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

    //Cria o menu automaticamente. Todo o texto que estiver como chapéu (h4) vai para o menu
    var menu = '';
    jsonData.conteudo.forEach(function (block) {
        switch (block.type) {
            case 'chapeu':
                menu += `<a href="#${block.value}" class="hamburgerItem" onclick="abreMenu()">${block.value}</a><br>`;
                break;
        }
    });
    document.getElementById('hamburger').innerHTML = menu;

    //Render do conteúdo 
    var conteudo = '';
    jsonData.conteudo.forEach(function (block) {
        switch (block.type) {
            case 'imagem':
                conteudo +=
                    `<figure class="${block.value.tamanho}"><img alt="${block.value.alt}" src="${block.value.fonte}"><figcaption class="legenda">${block.value.legenda}<span class="credito">${block.value.credito}</span></figcaption></figure>`;
                break;
            case 'pdf':
                conteudo +=
                    `<div class="pdfContainer"><object class="pdf" data="${block.value.fonte}?#zoom=25&scrollbar=1&toolbar=1&navpanes=1" type="application/pdf"></object></div>`;
                break;
            case 'youtubeVideo':
                conteudo +=
                    `<figure class="${block.value.tamanho}"><iframe style="margin: 1rem 0 0.5rem 0" width="100%" height="338" src="https://www.youtube.com/embed/${block.value.fonte}" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><figcaption class="legenda">${block.value.legenda}<span class="credito">${block.value.credito}</span></figcaption></figure>`;
                break;
            case 'filete_pontilhado':
                conteudo +=
                    `<hr class="filete_pontilhado">`;
                break;
            case 'filete_fino':
                conteudo +=
                    `<hr class="filete_fino">`;
                break;
            case 'filete_generos':
                conteudo +=
                    `<hr class="filete_generos">`;
                break;
            case 'filete_duplo':
                conteudo +=
                    `<hr class="filete_duplo">`;
                break;
            case 'separador':
                conteudo +=
                    `<hr class="filete_quadruplo">`;
                break;
            case 'titulinho':
                conteudo +=
                    `<h2>${block.value}</h2>`;
                break;
            case 'chapeu':
                conteudo +=
                    `<h4 id="${block.value}" class="chapeu">${block.value}</h4>`;
                break;
            case 'rodape':
                conteudo +=
                    `<p class="rodape">${block.value}</p>`;
                break;
            case 'lead':
                conteudo += `<p class="lead">${block.value}</p>`;
                break;
            default:
                conteudo += `<p class="texto">${block.value}</p>`;
                break;
        }
    });
    document.getElementById('conteudo').innerHTML = conteudo;


});

//Função para posicionar o chapéu logo abaixo do menu fixo quando selecionado
function addMargin() {
    window.scrollTo(0, window.pageYOffset - 130);
}

window.addEventListener('hashchange', addMargin);


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