
# Sistema de Gerenciamento de Eventos Acadêmicos 
***AcadEvent***

Documento de Projeto da Arquitetura do Sistema 

# 1. Visão Geral da Arquitetura 

O sistema AcadEvent foi concebido sob uma arquitetura Cliente-Servidor desacoplada em 3 camadas. A Camada de Apresentação será desenvolvida como uma aplicação frontend independente, utilizando React com Next.js, responsável exclusivamente pelo gerenciamento da interface do usuário. A Camada de Lógica de Negócio será implementada por meio do framework NestJS, estruturando o backend em Controladores (roteamento e validação de requisições HTTP), Serviços (processamento de regras de negócio e algoritmos) e Repositórios (acesso a dados via Prisma ORM). A Camada de Dados será gerenciada pelo PostgreSQL, banco de dados relacional responsável pela persistência  integridade de todas as informações do sistema. 

# 2. Organização em Camadas 

## 2.1 Camada de Apresentação — Frontend (Next.js) 

A camada de apresentação é responsável por renderizar todas as interfaces do sistema e intermediar a interação do usuário com a aplicação. Entre suas principais responsabilidades estão: a tela de inscrição de participantes em eventos, a visualização do cronograma de atividades, o painel de controle dos organizadores, o acompanhamento de frequência e a solicitação de emissão de certificados, além das demais interfaces necessárias para a gestão completa do escopo do evento. Essa camada consome exclusivamente os dados fornecidos pela API REST do backend, sem acesso direto ao banco de dados, garantindo o isolamento entre apresentação e lógica de negócio. 

## 2.2 Camada de Lógica de Negócio — Backend (NestJS) 

A camada de lógica de negócio é responsável pelo processamento de todas as regras e operações do sistema. Entre suas principais responsabilidades estão: a validação de inscrições, a verificação de conflitos de horário e disponibilidade de locais, o cálculo de carga horária para fins de certificação, o controle de acesso por perfil de usuário,  o processamento lógico e o gerenciamento do faturamento de inscrições (como o controle de status de pagamentos e geração de recibos) , o processamento de dados para a geração de relatórios gerenciais e a orquestração de todas as operações que envolvem persistência de dados, além das demais regras de negócio necessárias para a gestão completa do escopo do evento. Essa camada expõe uma API REST que serve de contrato de comunicação com a camada de apresentação. 

## 2.3 Camada de Dados — Banco de Dados (PostgreSQL + Prisma ORM) 

A camada de dados é responsável pela persistência, integridade e recuperação de todas as informações do sistema. O acesso a esta camada é realizado exclusivamente pela camada de lógica de negócio por meio do Prisma ORM, que atua como intermediário entre o código da aplicação e o banco de dados relacional. Nenhuma camada superior acessa o banco de dados diretamente, garantindo segurança e consistência das operações. Para o armazenamento de arquivos não estruturados (como documentos, tutoriais e vídeos), o sistema adota uma arquitetura agnóstica de provedor de infraestrutura. O backend será projetado utilizando interfaces (padrão Adapter), permitindo que o armazenamento seja configurável dependendo do ambiente. Para a fase de desenvolvimento, testes e entrega acadêmica, o sistema utilizará o sistema de arquivos local (Local File System), garantindo agilidade e zero custo de infraestrutura para a equipe. Contudo, o design arquitetural permite que, em um eventual ambiente de produção, esse módulo seja facilmente substituído por serviços de object storage em nuvem, como AWS S3 ou MinIO, sem a necessidade de refatorar a regra de negócio. 

# 3. Padrão Arquitetural — MVC Distribuído 

O projeto adota uma variante do padrão Model-View-Controller (MVC) denominada MVC Distribuído, na qual as camadas View e Model-Controller são executadas como aplicações independentes em processos e servidores distintos. A View é representada pela aplicação Next.js e o conjunto Model-Controller pelo backend NestJS. A comunicação entre as duas aplicações ocorre exclusivamente por meio de uma API REST, que trafega dados estruturados no formato JSON. Essa abordagem difere do MVC tradicional, no qual o servidor é responsável por renderizar e retornar páginas HTML completas a cada requisição, aumentando o volume de dados trafegados pela rede e o acoplamento entre apresentação e lógica de negócio. Na arquitetura adotada, o backend retorna exclusivamente dados, delegando ao frontend a responsabilidade de renderização, o que reduz significativamente o tráfego de rede e elimina o acoplamento entre as camadas. A escolha pelo MVC Distribuído é justificada por três características fundamentais para o AcadEvent. Primeiramente, a escalabilidade independente por camada: o frontend e o backend podem ser escalados separadamente conforme a demanda, sem que o crescimento de uma camada impacte os recursos da outra. Em segundo lugar, a agnósticidade de cliente: o desacoplamento permite que múltiplos clientes ─ aplicação web, aplicativo móvel ou integrações externas ─ consumam a mesma API sem necessidade de alterações na camada de negócio, preparando o sistema para expansões futuras. Por fim, a segurança por isolamento: toda a lógica de negócio, validações e acesso a dados residem exclusivamente no backend, inacessíveis diretamente pela camada de apresentação. Adicionalmente, a exposição de uma API REST que retorna dados estruturados em formato JSON atende nativamente à funcionalidade bônus de web services prevista nos requisitos do projeto, sem necessidade de desenvolvimento adicional específico para esse fim. 

# 4. Stack Tecnológico 

## 4.1 React com Next.js — Camada de Apresentação 

O **Next.js** foi escolhido como framework da camada de apresentação por oferecer roteamento estruturado em sistema de pastas, reduzindo a complexidade de gerenciamento de rotas em aplicações de média e alta escala. Em comparação com alternativas como Vue.js, o React com TypeScript (TSX) oferece maior robustez de tipagem, com detecção de erros em tempo de desenvolvimento, produzindo uma base de código mais segura e previsível. Adicionalmente, a ampla comunidade do React assegura disponibilidade de soluções para problemas complexos e sustentabilidade de longo prazo do projeto. 

## 4.2 NestJS — Camada de Lógica de Negócio 

O **NestJS** foi selecionado como framework do backend por adotar nativamente o paradigma de orientação a objetos por meio de decorators e injeção de dependência, atendendo diretamente ao requisito técnico do projeto. Sua arquitetura modular organiza o sistema em módulos independentes com responsabilidades bem definidas ─ cada módulo encapsulando seus próprios controllers e services ─ o que é especialmente adequado para o AcadEvent, dado o grande volume de entidades e funcionalidades a serem gerenciadas. 

## 4.3 PostgreSQL — Banco de Dados Relacional Principal 

O **PostgreSQL** foi escolhido como Sistema Gerenciador de Banco de Dados por ser um banco relacional robusto, atendendo ao requisito de modelagem relacional do projeto e permitindo o tratamento de integridade referencial, restrições de inserção e remoção, e o relacionamento entre todas as entidades do sistema. Em comparação com o MySQL, o PostgreSQL implementa Controle de Concorrência Multiversão (MVCC), no qual operações de leitura não bloqueiam operações de escrita, permitindo que o sistema opere normalmente sob carga concorrente. Sua robustez no gerenciamento de múltiplas conexões simultâneas o torna adequado para a escala prevista para o AcadEvent. Para módulos que demandem armazenamento de dados não estruturados, o sistema prevê integração com soluções complementares, mantendo o PostgreSQL como repositório relacional central conforme previsto nos requisitos do projeto. 

## 4.4 Prisma ORM — Acesso a Dados 

O **Prisma ORM** atua como camada de abstração entre o código da aplicação e o banco de dados, eliminando a exposição de SQL puro na base de código e reduzindo a superfície de ataque a vulnerabilidades como injeção de SQL. O modelo de dados é definido centralmente em um único arquivo de schema, facilitando a visualização e manutenção da estrutura do banco. O Prisma gera automaticamente tipos TypeScript baseados no schema, garantindo consistência entre o modelo de dados e o código da aplicação. A funcionalidade Prisma Migrate permite o versionamento e aplicação controlada de alterações na estrutura do banco de dados ao longo do ciclo de desenvolvimento. 

## 4.5 Docker — Ambiente de Desenvolvimento e Deploy 

O **Docker** é adotado para a conteinerização dos serviços do sistema, garantindo que todos os membros da equipe de desenvolvimento operem com versões idênticas de todas as tecnologias envolvidas, eliminando inconsistências de ambiente entre diferentes máquinas de desenvolvimento. Em um projeto de múltiplas equipes como o AcadEvent, essa padronização é essencial para a confiabilidade do processo de integração e deploy. A conteinerização permite ainda a restauração rápida do ambiente em caso de falhas, além de facilitar a replicação do ambiente de produção durante os testes. 

## 4.6 Jest — Framework de Testes 

O **Jest** será utilizado como framework de testes unitários do sistema, sendo adotado para a validação das regras de negócio implementadas na camada de lógica. Sua escolha é justificada pela integração nativa com o NestJS, que o inclui como dependência padrão em sua estrutura de projeto, eliminando a necessidade de configuração adicional. O Jest permitirá a criação de testes automatizados para os serviços e controladores de cada módulo, assegurando que os casos de uso implementados se comportem conforme especificado e atendendo diretamente ao requisito de desenvolvimento de módulo de testes previsto no projeto. 

# 5. Organização do Projeto 

O projeto adota a organização de diretórios por funcionalidade, denominada **Package by Feature**, na qual cada módulo do sistema agrupa em um único diretório seus respectivos controllers, services e modules. Essa abordagem é preferível à organização por tipo de arquivo (Package by Layer), na qual todos os controllers, services e modules ficam em pastas separadas sem relação funcional entre si. No contexto do AcadEvent, que prevê módulos como eventos, inscrições, certificados, participantes, patrocinadores, organizadores, entre outros, aorganização por camada resultaria em diretórios com dezenas de arquivos não relacionados, dificultando a manutenção e a localização de código. A organização por funcionalidade mantém cada módulo como uma unidade coesa eautossuficiente, alinhada com a estrutura nativa do NestJS, que foi projetado com esse padrão como base de sua arquitetura modular.
