# Bank Mobile 🏦

Aplicativo mobile de gerenciamento de transações bancárias desenvolvido com [Expo](https://expo.dev) e React Native. O projeto implementa autenticação com Firebase, integração com Cloud Firestore para persistência de dados e oferece uma experiência visual moderna com animações nativas.

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI instalado globalmente (`npm install -g expo-cli`)
- Uma conta no Firebase com projeto configurado
- Android Studio ou Xcode (para emuladores)

### Passos para Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/carollyb/bank-mobile
   cd bank-mobile
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure o Firebase**
   - Crie um arquivo `.env` na raiz do projeto com suas credenciais do Firebase:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCmvmnLjAs4SGLDiJDDCaGJE-IQm9L4C3E
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=bank-mobile-df4ec.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=bank-mobile-df4ec
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=bank-mobile-df4ec.firebasestorage.app
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=420246894148
   EXPO_PUBLIC_FIREBASE_APP_ID=1:420246894148:web:7d2afa1dbfff6ed17aee11
   ```

4. **Inicie a aplicação**

   ```bash
   npm start
   # ou
   npx expo start
   ```

5. **Escolha o ambiente de execução**

   No terminal, você verá opções para executar em:
   - **i** - iOS Simulator
   - **a** - Android Emulator
   - **w** - Web browser
   - **Expo Go** - Digitalize o QR code com o app Expo Go

## 📱 Funcionalidades

### 🏠 Tela Principal (Dashboard)

A tela principal oferece uma visão geral das finanças do usuário com as seguintes características:

- **Exibição de Saldo Total**: Mostra o saldo atual da conta do usuário
- **Gráficos e Análises Financeiras**: Visualização dos últimos 10 em um gráfico de linha que permite acompanhar a evolução do saldo ao longo do tempo
- **Últimas Transações**: Lista das 10 transações mais recentes
- **Animações Suaves**:
  - A seção "Últimas Transações" utiliza **fade-in animation** (Reanimated) que ativa automaticamente quando o usuário faz scroll para baixo na página
  - A opacidade é modificada dinamicamente baseada na posição de scroll, criando um efeito de aparição progressiva

### 💳 Tela de Listagem de Transações

Interface completa para visualizar e gerenciar todas as transações do usuário:

- **Lista Completa de Transações**: Exibição detalhada de todas as transações do usuário
- **Filtros Avançados**:
  - Filtro por tipo (Depósito, Saque, Transferência, Boleto)
  - Filtro por categoria customizadas
  - Filtro por período (data inicial e final)
  - Badge indicador do número de filtros ativos
  - Botão para limpar todos os filtros de uma vez
- **Paginação Eficiente**: Implementação de scroll infinito com paginação sob demanda (20 transações por página) para lidar com grandes volumes de dados de forma otimizada
- **Integração com Cloud Firestore**: Todas as transações são sincronizadas em tempo real com o banco de dados, garantindo dados sempre atualizados e sincronizados entre dispositivos
- **Gerenciamento Local**: Opção para deletar transações com confirmação de segurança
- **Refresh Manual**: Opção de atualizar a lista com pull-to-refresh

### ➕ Tela de Adicionar/Editar Transação

Interface intuitiva para criar novas transações e editar as existentes:

- **Campos de Entrada**:
  - Tipo de transação (Saque, Depósito, Transferência, Boleto)
  - Valor da transação com formatação automática
  - Data da transação com date picker nativo
  - Categoria (customizável, com opção de criar novas categorias)
  - Descrição (campo adicional)
  - Campos de origem e destino (para transferências)

- **Validação Avançada**:
  - Validação obrigatória de campos essenciais (valor)
  - Formatação automática de valores em formato monetário
  - Verificação de campos condicionais baseada no tipo de transação
  - Mensagens de erro informativas e amigáveis

- **Upload de Recibos**:
  - Possibilidade de anexar recibos e documentos relacionados à transação
  - Suporte para múltiplos formatos (imagens e PDFs)
  - Armazenamento seguro no Firebase Storage
  - Visualização e gerenciamento de anexos

- **Modo Edição**: Carregamento automático dos dados da transação para edição com possibilidade de atualização
- **Confirmações Visuais**: Mensagens de sucesso/erro após salvar as alterações

## 🛠️ Stack Tecnológico

- **Framework**: React Native com Expo
- **Roteamento**: Expo Router (file-based routing)
- **Autenticação**: Firebase Authentication
- **Banco de Dados**: Cloud Firestore
- **Animações**: React Native Reanimated
- **Gráficos**: Victory Native
- **Gerenciamento de Estado**: Context API
- **Validação**: Validação customizada
- **Estilagem**: StyleSheet React Native

## 📁 Estrutura do Projeto

```
bank-mobile/
├── app/                          # Telas e roteamento
│   ├── (auth)/                   # Telas de autenticação
│   ├── (protected)/              # Telas protegidas
│   │   ├── home.tsx             # Dashboard principal
│   │   └── transactions/         # Listar e gerenciar transações
│   └── (splash)/                 # Tela de splash
├── components/                   # Componentes reutilizáveis
├── context/                      # Context API (autenticação, transações)
├── styles/                       # Estilos centralizados
├── utils/                        # Funções utilitárias
├── types/                        # TypeScript types
└── config/                       # Configurações (Firebase)
```

## 🔐 Autenticação

O aplicativo utiliza Firebase Authentication com suporte para:

- Criação de novo usuário (Sign Up)
- Login com email e senha
- Logout seguro
- Persistência de sessão
- Token refresh automático

## 📊 Sincronização de Dados

Todos os dados são sincronizados em tempo real com o Cloud Firestore:

- Transações do usuário
- Saldo da conta
- Categorias customizadas
- Perfil do usuário

## 🐛 Tratamento de Erros

A aplicação conta com tratamento robusto de erros:

- Mensagens de erro amigáveis ao usuário
- Alertas informativos para situações especiais (falta de índices no Firestore)
- Fallback para dados locais quando disponível
- Log de erros para debugging

## 📚 Recursos Adicionais

- [Documentação Expo](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
