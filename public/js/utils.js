function incluirHtml(arquivo) {
    return HtmlService.createHtmlOutputFromFile(arquivo).getContent();
}

function incluirHtmlProcessado(arquivo) {
    var html = construirPagina(arquivo, dadosDoCache());
    return html.getContent();
}