# Wiki Bacon

**Conteúdo da Disciplina**: Grafos 1<br>

## Alunos

| Matrícula  | Aluno                        |
| ---------- | ---------------------------- |
| 19/0102390 | André Macedo Rodrigues Alves |
| 19/0108011 | Guilherme Brito Vilas - Bôas |

## Sobre

O projeto Wiki Bacon tem como objetivo encontrar o menor caminho entre duas páginas da Wikipédia utilizando uma BFS (Busca em Largura) e apresentar o resultado de forma clara e acessível ao usuário por meio de um aplicativo web.

Para começar, o aplicativo web exibe um formulário em que o usuário deve inserir a página de origem, a página de destino e o grau máximo em que a busca será feita. Essas informações são usadas como entrada para o algoritmo de busca, que irá utilizar a [API da Wikipédia](https://www.mediawiki.org/wiki/API:Main_page) para gerar as ligações entre as páginas através dos links. O algoritmo utilizado para gerar o grafo é uma BFS, os links de cada página são adicionados em uma fila para serem explorados posteriormente utilizando a API. Foi adicionado um limite de links a serem explorados por página para reduzir o tempo de execução.

Se o algoritmo de busca encontrar o menor caminho entre as duas páginas, o aplicativo web exibe o resultado ao usuário. Esse resultado inclui o menor caminho encontrado e o grafo gerado pela busca em largura utilizando a biblioteca [ngx-graph](https://swimlane.github.io/ngx-graph/).

O aplicativo Wiki Bacon é útil para usuários que desejam explorar a conexão entre diferentes páginas da Wikipédia e descobrir como elas estão relacionadas entre si. Por exemplo, um usuário pode estar interessado em descobrir como a página sobre Kevin Bacon está conectada à página sobre o filme "O Poderoso Chefão". O aplicativo irá mostrar o menor caminho possível entre as duas páginas e ajudar o usuário a entender como elas estão conectadas.

## Screenshots

### Formulário:

![formulário](./assets/image1.jpeg)

### Resultado de uma busca bem sucedida:

![formulário](./assets/image2.jpeg)
![formulário](./assets/image4.jpeg)

### Resultado de uma busca em que o menor caminho não foi encontrado:

![formulário](./assets/image3.jpeg)

## Instalação

**Linguagem**: Typescript<br>
**Framework**: Angular<br>

Certifique-se de ter o NodeJs (versão >= 18.0.0) instalado em sua máquina e
rode os seguintes comandos em seu terminal:

```bash
cd wiki-bacon
npm install --legacy-peer-deps

```

## Como rodar localmente

Após instalar as dependências utilizando o comando acima, para rodar o projeto, bastar digitar o seguinte comando na pasta wiki-bacon:

```bash
npm run start
```

## Uso

A maneira mais fácil de utilizar o app é visitando o [link do github pages](https://projeto-de-algoritmos.github.io/Grafos1-WikiBacon/) em que o projeto está hospedado.

No formulário da aba "Início", indique a página de origem e destino (em português), e o número de camadas que você quer procurar. É importante lembrar que os nomes devem estar iguais aos encontrados no título ou url da página da Wikipédia Br. Por exemplo:

Vamos supor que um usuário queira utilizar a seguinte página como origem:

https://pt.wikipedia.org/wiki/Kevin_Bacon

Ele poderá digitar no campo "Página Origem" do formulário: `Kevin_Bacon` ou `Kevin Bacon`. Pois os espaços serão tratados como underline posteriormente na aplicação.

Após preencher todos os campos, basta clicar em `Enviar` que o algoritmo começará a rodar e, após alguns segundos, irá retornar o grafo gerado.
