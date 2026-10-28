# 🐾 Pet Manager 

Sistema de Registro Público de Pets e Tutores, desenvolvido como parte do processo seletivo para vaga de Desenvolvedor Front-End da SEPLAG-MT.

Este projeto é uma aplicação **Next.js (Pages Router)** com renderização e navegação orientadas a páginas, usando **React** no client para consumo da API e uma UX focada em responsividade, feedback visual e boas práticas.

## 🚀 Tecnologias Utilizadas

### Core
*   **Framework Principal**: [Next.js 16](https://nextjs.org/) (Pages Router)
*   **Linguagem**: [TypeScript 5](https://www.typescriptlang.org/)
*   **React**: [React 19.2.3](https://react.dev/)

### Estilização e UI
*   **CSS Framework**: [Tailwind CSS 3.3.0](https://tailwindcss.com/)
*   **Componentes UI**: [Shadcn/ui](https://ui.shadcn.com/) (baseado em Radix UI)
*   **Ícones**: [React Icons](https://react-icons.github.io/react-icons/) e [Lucide](https://lucide.dev/) (usado por componentes Shadcn/ui)
*   **Animações**: [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)

### Requisições e Estado
*   **HTTP Client**: [Axios 1.13.2](https://axios-http.com/) (com Pattern Facade)
*   **Feedback Visual**: [React Hot Toast 2.4.1](https://react-hot-toast.com/)
*   **Gerenciamento de Estado**: React Hooks/Context API + [RxJS](https://rxjs.dev/) (BehaviorSubject em `src/stores/`)

### Utilitários
*   **Class Utilities**: [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge)
*   **Variants**: [class-variance-authority](https://github.com/joe-bell/cva)

## 📜 Scripts

```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm start            # produção (após build)
npm run lint         # lint
npm test             # testes
npm run test:watch   # testes em watch
npm run test:coverage # testes com cobertura
```

## ✨ Funcionalidades Implementadas

O projeto atende aos requisitos do edital, incluindo:

### 1. Tela Inicial - Listagem de Pets (`/`)
*   ✅ Visualização em cards responsivos com Shadcn/ui
*   ✅ Busca em tempo real por nome
*   ✅ Paginação integrada com a API (parâmetros `page` e `size`)
*   ✅ Exibição de foto do pet (quando disponível)
*   ✅ Placeholder visual quando não há foto
*   ✅ Loading states com Skeleton components
*   ✅ **Implementado**: Interface visual de paginação completa com botões anterior/próxima

### 2. Tela de Detalhamento de Pet (`/pets/[id]`)
*   ✅ Exibição completa dos dados do pet (Nome, Espécie, Raça, Idade)
*   ✅ Exibição do Tutor responsável (caso vinculado)
*   ✅ Layout responsivo com cards
*   ✅ Nome do pet em destaque com gradiente
*   ✅ Foto do pet em tamanho grande (quando disponível)

### 3. Gestão de Pets (`/cadastro/pet`)
*   ✅ Cadastro de novos pets (POST /v1/pets)
*   ✅ Edição de pets existentes (PUT /v1/pets/{id})
*   ✅ Campos: nome, espécie, idade, raça
*   ✅ **Upload de Foto** integrado (POST /v1/pets/{id}/fotos)
*   ✅ **Upload automático após cadastro**: Após criar o pet, recupera o ID e faz upload da foto automaticamente
*   ✅ **Preview de imagem** após seleção (mobile e desktop)
*   ✅ Validação de formulário
*   ✅ **Implementado**: Validação de idade (apenas números positivos)

### 4. Gestão de Tutores (`/tutores`)
*   ✅ Listagem completa de tutores
*   ✅ Cadastro de tutores (POST /v1/tutores)
*   ✅ Edição de dados pessoais (PUT /v1/tutores/{id})
*   ✅ Campos: nome completo, telefone, endereço, **email**, **CPF**
*   ✅ **Upload de Foto** integrado (POST /v1/tutores/{id}/fotos)
*   ✅ **Upload automático após cadastro**: Após criar o tutor, recupera o ID e faz upload da foto automaticamente
*   ✅ **Preview de imagem** após seleção (mobile e desktop)
*   ✅ **Vínculo Pet-Tutor**: Interface dedicada para pesquisar e vincular pets
*   ✅ Remover vínculo (DELETE /v1/tutores/{id}/pets/{petId})
*   ✅ Listagem de pets vinculados
*   ✅ **Implementado**: Máscaras de input:
  *   Telefone: `(XX) XXXXX-XXXX`
  *   CPF: `XXX.XXX.XXX-XX`
  *   Email: validação e formatação automática

### 5. Autenticação e Segurança
*   ✅ Login via JWT (POST /autenticacao/login)
*   ✅ **Refresh Token Automático**: Interceptor do Axios configurado para renovar o token transparentemente em caso de erro 401
*   ✅ Refresh token via PUT /autenticacao/refresh (token no header Authorization)
*   ✅ Context API para gerenciamento de estado de autenticação
*   ✅ Modal de login que cobre a tela quando não autenticado

## 📊 Estrutura de DTOs e API

### DTOs Implementados

#### Pet
```typescript
interface Pet {
    id: number;
    nome: string;
    especie: string;  // ⚠️ Nota: PetRequestDto no Swagger não inclui "especie"
    idade: number;
    raca: string;
    foto?: string | FotoDto;
    tutorId?: number;
}
```

#### Tutor (Proprietario)
```typescript
interface Tutor {
    id: number;
    nome: string;
    telefone: string;
    endereco: string;
    email?: string;
    cpf?: string;
    foto?: string | FotoDto;
    pets?: Pet[];
}
```

#### FotoDto (AnexoResponseDto)
```typescript
interface FotoDto {
    id: number;
    nome: string;
    contentType: string;
    url: string;
}
```

#### Autenticação
```typescript
// Request
interface AuthRequestDto {
    username: string;
    password: string;
}

// Response
interface AuthResponseDto {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;  // ⚠️ Não está sendo utilizado
}
```

#### Paginação
```typescript
interface Pageable<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
```

**Nota**: A API retorna `PagedPetResponseDto` com estrutura diferente (`page`, `size`, `total`, `pageCount`, `content`), mas o código atual funciona com a estrutura `Pageable` padrão do Spring.

### Discrepâncias Identificadas

1. **Campo `especie` no Pet**:
   - ✅ Implementado no frontend
   - **Status**: Funciona na prática, mas pode ser inconsistência na documentação

2. **Campos `email` e `cpf` no Tutor**:
   - ✅ `ProprietarioResponseDto` no Swagger inclui `email` e `cpf`
   - ✅ Implementados no frontend com máscaras
   - **Status**: Funcionalidade implementada e funcional

3. **Estrutura de Paginação**:
   - ✅ Código atual funciona com estrutura `Pageable` padrão
   - **Status**: Funcionando, mas pode precisar de ajuste se a API mudar

## 🏗️ Arquitetura e Decisões Técnicas

### Padrão Facade nos Serviços
Toda a comunicação com a API está centralizada na pasta `src/services`:
*   `petService.ts`: Operações CRUD de pets
*   `tutorService.ts`: Operações CRUD de tutores e vínculos
*   `authService.ts`: Autenticação e gerenciamento de tokens
*   `api.ts`: Instância do Axios com interceptors configurados

Isso desacopla a lógica de view das regras de negócio e endpoints.

### Componentização
*   Componentes reutilizáveis (Header, LoginModal)
*   Componentes Shadcn/ui para UI consistente
*   Componentes específicos por página quando necessário

### Gerenciamento de Estado
*   **Context API**: Para autenticação global (`AuthContext`)
*   **BehaviorSubject (RxJS)**: Stores reativos para gerenciamento de estado
  *   `src/stores/authStore.ts` - Estado de autenticação com BehaviorSubject
  *   `src/stores/petStore.ts` - Estado de pets com BehaviorSubject
  *   `src/stores/tutorStore.ts` - Estado de tutores com BehaviorSubject
*   **React Hooks**: useState e useEffect para estado local
*   **LocalStorage**: Para persistência de tokens

### Validação e Tratamento de Imagens
*   Função helper `getFotoUrl()` para extrair URL de `FotoDto` ou string
*   Função helper `isValidImageUrl()` para validar URLs antes de renderizar
*   Suporte para blob URLs (preview local) e URLs do servidor
*   **Upload automático de fotos**: Após cadastro de pet ou tutor, o sistema automaticamente recupera o ID retornado e faz upload da foto usando o endpoint específico (`POST /v1/pets/{id}/fotos` ou `POST /v1/tutores/{id}/fotos`)
*   Campo de upload usa `"foto"` no FormData conforme documentação Swagger

### Responsividade
*   Layout *mobile-first* utilizando classes utilitárias do Tailwind
*   Breakpoints: `md:` (768px) e `lg:` (1024px)
*   Grid responsivo para cards de pets

## 📁 Estrutura do Projeto

```
pet-manager/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/              # Componentes Shadcn/ui
│   │   ├── Header/          # Cabeçalho da aplicação
│   │   └── LoginModal/      # Modal de autenticação
│   ├── context/             # Context API
│   │   └── AuthContext.tsx  # Context de autenticação
│   ├── lib/                 # Utilitários
│   │   └── utils.ts         # Funções auxiliares (cn, getFotoUrl, isValidImageUrl)
│   ├── pages/               # Páginas Next.js (Pages Router)
│   │   ├── index.tsx        # Listagem de pets
│   │   ├── pets/
│   │   │   └── [id].tsx     # Detalhes do pet
│   │   ├── cadastro/
│   │   │   ├── pet.tsx      # Cadastro/edição de pet
│   │   │   └── tutor.tsx    # Cadastro de tutor
│   │   └── tutores/
│   │       ├── index.tsx    # Listagem de tutores
│   │       └── [id].tsx     # Detalhes do tutor
│   ├── services/            # Serviços de API (Pattern Facade)
│   │   ├── api.ts           # Instância Axios com interceptors
│   │   ├── authService.ts   # Autenticação
│   │   ├── petService.ts    # Operações de pets
│   │   └── tutorService.ts  # Operações de tutores
│   ├── styles/
│   │   └── globals.css      # Estilos globais e variáveis CSS
│   └── types/
│       └── index.ts         # Definições TypeScript
├── public/                  # Arquivos estáticos
├── .env.local               # Variáveis de ambiente locais (recomendado; não commitar)
├── .env                     # Variáveis de ambiente (opcional; não commitar)
├── next.config.mjs          # Configuração Next.js
├── tailwind.config.ts       # Configuração Tailwind
├── tsconfig.json            # Configuração TypeScript
└── package.json             # Dependências do projeto
```

## 📦 Como Rodar Localmente

### Pré-requisitos
*   Node.js 18+ (recomendado: Node.js 20+)
*   NPM ou Yarn

### Passos

1.  **Clone o repositório**
    ```bash
    git clone <url-do-repositorio>
    cd pet-manager
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configure as variáveis de ambiente**
    Crie um arquivo `.env.local` na raiz do projeto:
    ```env
    NEXT_PUBLIC_URL_BACKEND=https://pet-manager-api.geia.vip
    ```

    **Importante (Next.js)**: variáveis com prefixo `NEXT_PUBLIC_` são **inlined no build** e também usadas no client. Então, para produção/Docker, o valor precisa estar correto no momento do `next build` (referência oficial: [Environment Variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)).

4.  **Execute o servidor de desenvolvimento**
    ```bash
    npm run dev
    ```

5.  **Acesse a aplicação**
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Credenciais de Teste
*   **Usuário**: `admin`
*   **Senha**: `admin`

## 🎭 Modo Demonstração (API simulada)

A API oficial do desafio (`https://pet-manager-api.geia.vip`) saiu do ar. Para que o projeto continue navegável, há um modo demo com uma API simulada dentro do próprio Next.js (`src/pages/api/mock/[...path].ts`), que implementa os mesmos endpoints e formatos usados pelo front: login e refresh de token, listagem paginada/filtrada, detalhe, cadastro, edição e exclusão de pets e tutores, upload de foto e vínculo pet-tutor.

Para ativar, aponte a variável de ambiente para o mock (valor definido em tempo de build):

```env
NEXT_PUBLIC_URL_BACKEND=/api/mock
```

*   **Credenciais demo**: usuário `admin` e senha `admin`.
*   **Dados fictícios**: 20 pets e 12 tutores inventados em `src/mock/dados.ts` (telefones, CPFs e endereços não são reais). Com o mock ativo, a interface exibe o aviso "Modo demonstração".
*   **Estado volátil**: as alterações ficam apenas em memória no servidor e voltam aos dados iniciais quando a função reinicia (novo deploy, cold start na Vercel) e podem diferir entre instâncias. As fotos enviadas não são gravadas: o mock devolve uma ilustração em SVG.

## 🐳 Docker

A aplicação está containerizada e pronta para deploy. O Dockerfile utiliza multi-stage build para otimizar o tamanho da imagem final.

### Build da Imagem

```bash
# Build (IMPORTANTE: NEXT_PUBLIC_URL_BACKEND precisa ser informado no build)
docker build --build-arg NEXT_PUBLIC_URL_BACKEND=https://pet-manager-api.geia.vip -t pet-manager .
```

### Executar o Container

```bash
# Executar o container na porta 3000
docker run -p 3000:3000 --name pet-manager pet-manager

# Ou em modo detached (background)
docker run -d -p 3000:3000 --name pet-manager pet-manager
```

### Variáveis de Ambiente

O container aceita as seguintes variáveis de ambiente:

- `NEXT_PUBLIC_URL_BACKEND`: **build-time** (obrigatório para apontar a API; não muda após o build)
- `PORT`: Porta do servidor (padrão: 3000)
- `NODE_ENV`: Ambiente de execução (padrão: production)

### Exemplo com Docker Compose

Crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  pet-manager:
    build:
      context: .
      args:
        NEXT_PUBLIC_URL_BACKEND: https://pet-manager-api.geia.vip
    ports:
      - "3000:3000"
    restart: unless-stopped
```

Execute com:
```bash
docker-compose up -d
```

## 🧪 Testes

✅ **Status**: Testes unitários implementados

O projeto possui testes unitários configurados com Jest e React Testing Library:

```bash
# Executar testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

### Testes Implementados

- ✅ `src/services/__tests__/petService.test.ts`
- ✅ `src/services/__tests__/tutorService.test.ts`
- ✅ `src/services/__tests__/authService.test.ts`
- ✅ `src/components/LoginModal/__tests__/index.test.tsx`
- ✅ `src/context/__tests__/AuthContext.test.tsx`

## 🔍 Notas do Desenvolvedor

### API Base
*   URL: `https://pet-manager-api.geia.vip`
*   Swagger: `https://pet-manager-api.geia.vip/q/swagger-ui/`

### Decisões de Design
*   Foi priorizada a experiência do usuário (UX), com feedbacks visuais (toasts) para todas as ações
*   Uso de Shadcn/ui para componentes consistentes e acessíveis
*   Preview de imagem imediato após upload para melhor UX
*   Validação robusta de URLs de imagem para evitar erros no console

### Limitações Conhecidas
*   Nenhuma limitação conhecida no momento

---

**Desenvolvido para o Processo Seletivo SEPLAG-MT 2026.**

**Versão**: 1.0.0  
**Data**: Janeiro 2026
