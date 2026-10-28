// Dados ficticios do modo demonstracao (NEXT_PUBLIC_URL_BACKEND=/api/mock).
// Nomes, telefones, CPFs, e-mails e enderecos sao inventados e invalidos de proposito.

export interface PetSeed {
    id: number;
    nome: string;
    idade: number;
    raca: string;
    comFoto: boolean;
}

export interface TutorSeed {
    id: number;
    nome: string;
    telefone: string;
    endereco: string;
    email: string;
    cpf: string;
    comFoto: boolean;
}

export const petsIniciais: PetSeed[] = [
    { id: 1, nome: "Bolota", idade: 3, raca: "Vira-lata caramelo", comFoto: true },
    { id: 2, nome: "Pipoca", idade: 5, raca: "Poodle toy", comFoto: true },
    { id: 3, nome: "Tobias", idade: 8, raca: "Siamês", comFoto: true },
    { id: 4, nome: "Mel", idade: 2, raca: "Golden retriever", comFoto: true },
    { id: 5, nome: "Nuvem", idade: 1, raca: "Persa", comFoto: true },
    { id: 6, nome: "Fandango", idade: 6, raca: "Beagle", comFoto: true },
    { id: 7, nome: "Jujuba", idade: 4, raca: "Shih tzu", comFoto: true },
    { id: 8, nome: "Zeca", idade: 10, raca: "Vira-lata preto", comFoto: false },
    { id: 9, nome: "Pingo", idade: 2, raca: "Dachshund", comFoto: true },
    { id: 10, nome: "Canela", idade: 7, raca: "Labrador", comFoto: true },
    { id: 11, nome: "Biscoito", idade: 1, raca: "Corgi", comFoto: true },
    { id: 12, nome: "Estrela", idade: 9, raca: "Maine coon", comFoto: true },
    { id: 13, nome: "Maracujá", idade: 3, raca: "Border collie", comFoto: true },
    { id: 14, nome: "Sorvete", idade: 4, raca: "Bulldog francês", comFoto: false },
    { id: 15, nome: "Trovão", idade: 12, raca: "Pastor alemão", comFoto: true },
    { id: 16, nome: "Panqueca", idade: 2, raca: "Ragdoll", comFoto: true },
    { id: 17, nome: "Quindim", idade: 5, raca: "Spitz alemão", comFoto: true },
    { id: 18, nome: "Gaspar", idade: 11, raca: "Sem raça definida", comFoto: true },
    { id: 19, nome: "Lótus", idade: 6, raca: "Bengal", comFoto: true },
    { id: 20, nome: "Rabisco", idade: 3, raca: "Yorkshire", comFoto: false },
];

export const tutoresIniciais: TutorSeed[] = [
    {
        id: 1,
        nome: "Aurora Pitanga de Exemplo",
        telefone: "(00) 90000-0001",
        endereco: "Rua das Jabuticabeiras Imaginárias, 100, Bairro Fictício, Cidade de Mentirinha/ZZ",
        email: "aurora.pitanga@exemplo.invalid",
        cpf: "000.000.001-00",
        comFoto: true,
    },
    {
        id: 2,
        nome: "Dionísio Marimbondo Teste",
        telefone: "(00) 90000-0002",
        endereco: "Avenida dos Sonhos Inexistentes, 200, Bairro Fictício, Cidade de Mentirinha/ZZ",
        email: "dionisio.marimbondo@exemplo.invalid",
        cpf: "000.000.002-00",
        comFoto: true,
    },
    {
        id: 3,
        nome: "Eulália Cambalhota Demo",
        telefone: "(00) 90000-0003",
        endereco: "Travessa do Nunca, 300, Vila Imaginária, Cidade de Mentirinha/ZZ",
        email: "eulalia.cambalhota@exemplo.invalid",
        cpf: "000.000.003-00",
        comFoto: true,
    },
    {
        id: 4,
        nome: "Florisbela Quimera Silva Fictícia",
        telefone: "(00) 90000-0004",
        endereco: "Alameda das Nuvens de Algodão, 400, Jardim Inventado, Cidade de Mentirinha/ZZ",
        email: "florisbela.quimera@exemplo.invalid",
        cpf: "000.000.004-00",
        comFoto: false,
    },
    {
        id: 5,
        nome: "Hermenegildo Tapioca Amostra",
        telefone: "(00) 90000-0005",
        endereco: "Rua Sem Número Real, 500, Bairro Fictício, Cidade de Mentirinha/ZZ",
        email: "hermenegildo.tapioca@exemplo.invalid",
        cpf: "000.000.005-00",
        comFoto: true,
    },
    {
        id: 6,
        nome: "Ismênia Bem-te-vi Exemplar",
        telefone: "(00) 90000-0006",
        endereco: "Estrada da Lua de Papel, 600, Sítio Imaginário, Cidade de Mentirinha/ZZ",
        email: "ismenia.bemtevi@exemplo.invalid",
        cpf: "000.000.006-00",
        comFoto: true,
    },
    {
        id: 7,
        nome: "Juvenal Pirilampo Ficção",
        telefone: "(00) 90000-0007",
        endereco: "Praça do Faz de Conta, 700, Centro Fictício, Cidade de Mentirinha/ZZ",
        email: "juvenal.pirilampo@exemplo.invalid",
        cpf: "000.000.007-00",
        comFoto: true,
    },
    {
        id: 8,
        nome: "Leocádia Girassol Teste",
        telefone: "(00) 90000-0008",
        endereco: "Rua dos Ipês de Mentira, 800, Bairro Fictício, Cidade de Mentirinha/ZZ",
        email: "leocadia.girassol@exemplo.invalid",
        cpf: "000.000.008-00",
        comFoto: false,
    },
    {
        id: 9,
        nome: "Nicanor Paçoca Demonstração",
        telefone: "(00) 90000-0009",
        endereco: "Avenida do Arco-Íris Falso, 900, Vila Imaginária, Cidade de Mentirinha/ZZ",
        email: "nicanor.pacoca@exemplo.invalid",
        cpf: "000.000.009-00",
        comFoto: true,
    },
    {
        id: 10,
        nome: "Odete Carambola Fictícia",
        telefone: "(00) 90000-0010",
        endereco: "Rua da Imaginação, 1000, Jardim Inventado, Cidade de Mentirinha/ZZ",
        email: "odete.carambola@exemplo.invalid",
        cpf: "000.000.010-00",
        comFoto: true,
    },
    {
        id: 11,
        nome: "Policarpo Abacaxi Modelo",
        telefone: "(00) 90000-0011",
        endereco: "Beco do Tanto Faz, 1100, Bairro Fictício, Cidade de Mentirinha/ZZ",
        email: "policarpo.abacaxi@exemplo.invalid",
        cpf: "000.000.011-00",
        comFoto: true,
    },
    {
        id: 12,
        nome: "Querubina Fumaça Exemplo",
        telefone: "(00) 90000-0012",
        endereco: "Rua das Estrelas de Cartolina, 1200, Centro Fictício, Cidade de Mentirinha/ZZ",
        email: "querubina.fumaca@exemplo.invalid",
        cpf: "000.000.012-00",
        comFoto: false,
    },
];

// Pares [tutorId, petId]
export const vinculosIniciais: Array<[number, number]> = [
    [1, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [3, 5],
    [4, 6],
    [5, 7],
    [5, 6],
    [6, 9],
    [7, 10],
    [7, 11],
    [7, 12],
    [8, 13],
    [9, 15],
    [10, 16],
    [10, 17],
    [11, 18],
    [12, 19],
    [2, 1],
];
