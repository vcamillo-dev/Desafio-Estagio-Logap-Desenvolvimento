# LogiTrack - Gestão de frota

Aplicação web para visualizar e gerenciar veiculos e manutenções de uma frota. O projeto foi desenvolvido como MVP para o desafio de estágio para desenvolvimento da empresa LogAp I.T Solutions. Tendo como foco principal o modulo 2 (Agendamento e acompanhamento de manutenções)

## O que o sistema faz ?

- Realiza a autenticação de login através do supabase e caso esteja tudo ok, devolve uma sessão com token de acesso
- Mostra indicadores gerais da frota como: Quantidade de viagens de cada tipo de veiculo, veiculo que mais rodou, gasto esperando em manutenções no mes atual.
- Lista, filtra ordena, realiza cadastro, edita e exclui manutenções
- Lista, filtra ordena, realiza cadastro, edita, exclui e permite visualizar dados dos veiculos.
- Possui uma aba financeira, que mostra o valor gasto/estimado dos meses que já passaram e dos meses que estão por vir com base das manutenções cadastradas.
- Mantem os dados registrados no banco e continua mesmo que a pagina seja fechada ou front-end reiniciado

## Como rodar o projeto ?
[!NOTE]
Realizei todo projeto utilizando Kubuntu
### Pré-requisitos

- Docker
- Docker compose