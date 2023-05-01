# Wiki Bacon

**Número da Lista**: X<br>
**Conteúdo da Disciplina**: Grafos 1<br>

## Alunos

| Matrícula  | Aluno                        |
| ---------- | ---------------------------- |
| 19/0102390 | André Macedo Rodrigues Alves |
| xx/xxxxxx  | Guilherme Brito -            |

## Sobre

O projeto Wiki Bacon tem como objetivo encontrar o menor caminho entre duas páginas da Wikipédia utilizando uma BFS (Busca em Largura) e apresentar o resultado de forma clara e acessível ao usuário por meio de um aplicativo web.

Para começar, o aplicativo web exibe um formulário em que o usuário deve inserir a página de origem, a página de destino e o grau máximo em que a busca será feita. Essas informações são usadas como entrada para o algoritmo de busca, que irá utilizar a [API da Wikipédia](https://www.mediawiki.org/wiki/API:Main_page) para gerar as ligações entre as páginas através dos links. O algoritmo utilizado para gerar o grafo é uma BFS, os links de cada página são adicionados em uma fila para serem explorados posteriormente utilizando a API. Foi adicionado um limite de links a serem explorados por página para reduzir o tempo de execução.

Se o algoritmo de busca encontrar o menor caminho entre as duas páginas, o aplicativo web exibe o resultado ao usuário. Esse resultado inclui o menor caminho encontrado e o grafo gerado pela busca em largura utilizando a biblioteca [ngx-graph](https://swimlane.github.io/ngx-graph/).

O aplicativo Wiki Bacon é útil para usuários que desejam explorar a conexão entre diferentes páginas da Wikipédia e descobrir como elas estão relacionadas entre si. Por exemplo, um usuário pode estar interessado em descobrir como a página sobre Kevin Bacon está conectada à página sobre o filme "O Poderoso Chefão". O aplicativo irá mostrar o menor caminho possível entre as duas páginas e ajudar o usuário a entender como elas estão conectadas.

## Screenshots

Adicione 3 ou mais screenshots do projeto em funcionamento.

## Instalação

**Linguagem**: Typescript<br>
**Framework**: Angular<br>

Certifique-se de ter o NodeJs (versão >= 18.0.0) instalado em sua máquina e
rode os seguintes comandos em seu terminal:

```bash
cd wiki-bacon
npm install --legacy-peer-deps

```

## Uso

A maneira mais fácil de utilizar o app é visitando o [link do github pages](https://projeto-de-algoritmos.github.io/Grafos1-WikiBacon/) em que o projeto está hospedado.

No formulário da aba "Início", indique a página de origem e destino (em português), e o número de camadas que você quer procurar. É importante lembrar que os nomes devem estar iguais aos encontrados na url da Wikipédia BR. Por exemplo:

Vamos supor que um usuário queira utilizar a seguinte página como origem:

https://pt.wikipedia.org/wiki/Kevin_Bacon

Ele deverá digitar no campo "Página Origem" do formulário apenas: `Kevin_Bacon`

Seguindo o padrão encontrado após o path "/wiki/" da url.

Após preencher todos os campos, basta clicar em `Enviar` que o algoritmo começará a rodar e, após alguns segundos, irá retornar o grafo gerado.

## Outros

Quaisquer outras informações sobre seu projeto podem ser descritas abaixo.
