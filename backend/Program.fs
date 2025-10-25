open System
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting

[<EntryPoint>]
let main args =
    let builder = 
        // 1. Loads appsettings.json
        // 2. Loads appsettings.{environment}.json (Environment is set by the ASPNETCORE_ENVIRONMENT environment variable)
        // 3. Loads environment variables
        // 4. Loads command line arguments
        WebApplication.CreateBuilder(args)
    let app = builder.Build()

    app.MapGet("/", Func<string>(fun () -> "Hello World!")) |> ignore

    app.Run()

    0 // Exit code

