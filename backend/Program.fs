open System.Reflection
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.DependencyInjection
open DbUp
open Dapper.FSharp.MySQL
open MySqlConnector
open Giraffe

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

type Todo =
    { Id: int
      Description: string
      Status: string }

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

    // Configure option types for Dapper
    OptionTypes.register ()

    task {
        use conn = new MySqlConnection(connectionString)

        let newTodo =
            { Id = 0
              Description = "Learn F# with Dapper.FSharp"
              Status = "in-progress" }

        let! inserted =
            insert {
                into table<Todo>
                value newTodo
            }
            |> conn.InsertAsync

        printfn $"✅ Inserted todo with id: {inserted}"

        let! retrieved =
            select {
                for t in table<Todo> do
                    where (t.Id = inserted)
            }
            |> conn.SelectAsync<Todo>

        retrieved
        |> Seq.toList
        |> List.iter (fun todo -> printfn $"📝 Retrieved todo: {todo.Description} - Status: {todo.Status}")

    }
    |> Async.AwaitTask
    |> Async.RunSynchronously

    builder.Services.AddGiraffe() |> ignore
    builder.Services.AddCors() |> ignore

    let app = builder.Build()

    app.UseCors(fun policy -> policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader() |> ignore)
    |> ignore

    let webApp = route "/" >=> text "Hello World!"

    app.UseGiraffe webApp

    app.Run()

    0 // Exit code
