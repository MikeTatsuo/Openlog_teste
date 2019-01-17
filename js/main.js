window.onload = function () {
    FuncoesMaisUtilizadas();
}

function FuncoesMaisUtilizadas() {
    var requestURL = "./json/mais_util.json";
    var request = new XMLHttpRequest();
    request.open("GET", requestURL, true);
    request.overrideMimeType("application/json")
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status == 200) {
                var json = JSON.parse(request.response)
                json.funcoes.forEach(function (funcao) {
                    CriarBotao(funcao);
                });
            }
        }
    }
}

function CriarBotao(funcao) {
    let funcoes = document.getElementById("funcoes");
    let botao = document.createElement("button");
    botao.classList.add("btn");
    botao.classList.add("btn-outline-secondary");
    botao.type = "button";
    botao.innerHTML = funcao;
    funcoes.appendChild(botao);
}