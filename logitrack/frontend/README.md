# LogiTrack Frontend

A interface React é executada pelo Docker Compose da raiz do projeto. Para iniciar o PostgreSQL, o backend e o frontend, consulte o `README.md` da raiz e execute `docker compose up --build`.

Depois que os serviços iniciarem, abra `http://localhost:5173`. O Vite encaminha as chamadas `/api` ao serviço Spring Boot `app` na rede Docker.
