window.onload = function () {
    funcoesMaisUtilizadas();
    gerarGrafico();
}

function funcoesMaisUtilizadas() {
    getJSON("./json/mais_util.json").then(function (data) {
        data.funcoes.forEach(function (funcao) {
            criarBotao(funcao);
        });
    }).catch(function (erro) {
        alert(erro)
    })
}

function criarBotao(funcao) {
    let funcoes = document.getElementById("funcoes");
    let botao = document.createElement("button");
    botao.classList.add("btn");
    botao.classList.add("btn-outline-secondary");
    botao.type = "button";
    botao.innerHTML = funcao;
    funcoes.appendChild(botao);
}

function getJSON(url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.overrideMimeType("application/json")
        request.send(null);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    var json = JSON.parse(request.response)
                    resolve(json)
                } else {
                    reject("Erro: " + request.status)
                }
            }
        }
    })
}

function gerarGrafico() {
    let canvas = document.getElementById("grafico")
    let grafico = canvas.getContext("2d")

    getJSON("./json/performance.json").then(function (json) {
        let xStartpoint = 20
        let yStartpoint = 5
        let xEndpoint = grafico.canvas.width;
        let yEndpoint = grafico.canvas.height - 30;
        gerarGrade(grafico, dataInicial(json.performance), xStartpoint, xEndpoint, yStartpoint, yEndpoint)
        gerarGraficoDados(grafico, json.performance, xStartpoint, xEndpoint, yStartpoint, yEndpoint)
    }).catch(function (erro) {
        alert(erro)
    })
}

function gerarGrade(grafico, dtInicial, xStart, xEnd, yStart, yEnd) {
    let data = dtInicial;
    let xOrigin = xStart - 2;
    let yOrigin = yStart;
    grafico.font = "5px sans-serif"
    grafico.textAlign = "end"

    // gera os eixos cartesianos x e y
    grafico.beginPath()
    grafico.strokeStyle = "black"
    grafico.moveTo(xStart, yStart)
    grafico.lineTo(xStart, yEnd);
    grafico.lineTo(xEnd, yEnd);
    grafico.stroke()

    grafico.beginPath()
    grafico.strokeStyle = "grey"

    // loop para desenhar as linhas horizontais
    for (let count = 0; count <= 6; count++) {
        if (count != 0) {
            yOrigin = ((yEnd - yStart) / 6) * count + yStart
        }
        grafico.moveTo(xOrigin, yOrigin)

        if (count < 6) {
            grafico.lineTo(xEnd, yOrigin)
        }

        // legenda (porcentagem)
        let porcentagem = ((120 - (120 / 6) * count).toString()) + " %"
        grafico.fillText(porcentagem, xOrigin, yOrigin)
    }

    yEnd = yEnd + 2;

    // loop para desenhar as linhas verticais
    for (let count = 1; count <= 31; count++) {
        xOrigin = ((xEnd - xStart) / 31) * count + xStart
        grafico.moveTo(xOrigin, yStart)
        grafico.lineTo(xOrigin, yEnd)

        // legenda (data)
        if (count % 2 == 0) {
            grafico.fillText(formataData(data), xOrigin, yEnd + 14)
        } else {
            grafico.fillText(formataData(data), xOrigin, yEnd + 7)
        }

        data.setDate(data.getDate() + 1)
    }

    grafico.stroke()
}

function stringToDate(stringDate) {
    let data = new Date(stringDate)
    return data
}

function dataInicial(performance) {
    let oldest = 0

    performance.forEach(function (p) {
        let data = stringToDate(p.data)
        if (oldest == 0 || data < oldest) {
            oldest = data
        }
    })

    return oldest
}

function formataData(data) {
    let formatado = ("00" + data.getUTCDate()).slice(-2) + "/" + ("00" + (data.getUTCMonth() + 1)).slice(-2)
    return formatado
}

function gerarGraficoDados(grafico, dados, xStart, xEnd, yStart, yEnd) {
    let xStep = (xEnd - xStart) / 31
    let xSteps = 0
    let xOffset = xStep / 2
    let xOrigin = xStart + xOffset
    let yStep = (yEnd - yStart) / 120
    let inicio = dataInicial(dados)
    let xPosition = 0
    let yPosition = 0
    let texto = ""
    let propriedade = ""
    grafico.textAlign = "start"

    // loop para cada gráfico
    for (let path = 1; path <= 3; path++) {
        grafico.beginPath()
        grafico.strokeStyle = path == 1 ? "green" : path == 2 ? "red" : "blue";
        propriedade = path == 3 ? "informacao" : "no_prazo"

        // loop para posicionar os dados no gráfico
        dados.forEach(function (dado) {
            let data = new Date(dado.data)
            xSteps = ((data.getTime() - inicio.getTime()) / 86400000) * xStep
            xPosition = xSteps + xOrigin
            yPosition = path == 2 ? yEnd - (yStep * (100 - dado[propriedade])) : yEnd - (yStep * dado[propriedade])
            if (xSteps == 0) {
                grafico.moveTo(xPosition, yPosition)
            } else {
                grafico.lineTo(xPosition, yPosition)
            }
        })

        // legenda
        xPosition = (xEnd/4) *path
        yPosition = yEnd + 21
        texto = path == 1? " % no prazo" : path == 2? " % fora prazo": " % informação no prazo"
        grafico.moveTo(xPosition, yPosition)
        grafico.lineTo(xPosition - 10, yPosition)
        grafico.fillText(texto, xPosition, yPosition + 2)

        grafico.stroke()
    }
}