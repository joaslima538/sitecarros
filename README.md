# OVERDRIVE®

Vitrine interativa de carros tunados com Nissan GT-R R35, Toyota Supra MK4 e Mazda RX-7 FD.

## Rodar localmente

Na raiz do repositório, execute:

```sh
python3 -m http.server 4173
```

Abra `http://localhost:4173` no navegador. Escolha um modelo pelas miniaturas, pelas setas ou arrastando a cena para o lado com o mouse ou o dedo. A rolagem horizontal do trackpad também troca o modelo. Role para baixo para abrir a ficha técnica em vista superior do carro selecionado. Na seção **Experiência**, role para acelerar o GT-R.

O site usa HTML, CSS e JavaScript sem dependências de instalação.

A chegada animada usa imagens detalhadas dos carros e roda no navegador sem depender de WebGL.

## Publicar no Render

Conecte este repositório como um Blueprint no Render e selecione a branch `deploy/render`.
O arquivo `render.yaml` cria um site estático e copia a página, o código e os recursos para `dist/`.
