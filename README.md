# F# Web App Skeleton
## Frontend
- Typescript
- React
- Tailwind
- Prettier
- React query
- clsx
- CRUD example

### Run
- `cd frontend`
- `npm install`
- `npm run dev`

### Original setup commands
- `npm create vite@latest . -- --template react-ts`

## Backend
- F#
- Giraffe CRUD example
- Fantomas
- DbUp with example migration
- Dapper ORM

### Run
- `cd backend`
- `dotnet tool restore`
- `dotnet watch run`

### Formatting
- `dotnet fantomas .`

### Original setup commands
- `dotnet new web -lang F#`
- Simple gitignore with /bin and /obj
- `dotnet new tool-manifest`
- `dotnet new globaljson`
