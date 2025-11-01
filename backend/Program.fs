open System.Reflection
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.DependencyInjection
open Giraffe
open DbUp

let runMigrations (connectionString: string) =
    let upgrader =
        DeployChanges.To
            .MySqlDatabase(connectionString)
            .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly(), fun script -> script.EndsWith ".sql")
            .LogToConsole()
            .Build()

    let result = upgrader.PerformUpgrade()

    if result.Successful then
        printfn "✅ Database upgrade successful"
    else
        failwith $"❌ Database upgrade failed: {result.Error.Message}"

[<EntryPoint>]
let main args =
    let builder =
        // 1. Loads appsettings.json
        // 2. Loads appsettings.{environment}.json (Environment is set by the ASPNETCORE_ENVIRONMENT environment variable)
        // 3. Loads environment variables
        // 4. Loads command line arguments
        WebApplication.CreateBuilder(args)

    let connectionString = builder.Configuration["ConnectionString"]

    EnsureDatabase.For.MySqlDatabase(connectionString)
    runMigrations connectionString

    builder.Services.AddGiraffe() |> ignore
    builder.Services.AddCors() |> ignore

    let app = builder.Build()

    app.UseCors(fun policy -> policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader() |> ignore)
    |> ignore

    let webApp = route "/" >=> text "Hello World!"

    app.UseGiraffe webApp

    app.Run()

    0 // Exit code
