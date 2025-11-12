module Todo

open Dapper.FSharp.MySQL
open MySqlConnector
open Giraffe

module Handler =
    type Todo =
        { Id: int
          Description: string
          Status: string }

    type CreateTodoRequest = { Description: string; Status: string }

    let get connectionString : HttpHandler =
        fun (next: HttpFunc) (ctx: Microsoft.AspNetCore.Http.HttpContext) ->
            task {
                use conn = new MySqlConnection(connectionString)

                let! todos =
                    select {
                        for t in table<Todo> do
                            selectAll
                    }
                    |> conn.SelectAsync<Todo>

                let todosList = todos |> Seq.toList
                return! Successful.OK todosList next ctx
            }

    let create connectionString : HttpHandler =
        fun (next: HttpFunc) (ctx: Microsoft.AspNetCore.Http.HttpContext) ->
            task {
                let! request = ctx.BindJsonAsync<CreateTodoRequest>()
                use conn = new MySqlConnection(connectionString)

                let newTodo =
                    { Id = 0
                      Description = request.Description
                      Status = request.Status }

                let! insertedId =
                    insert {
                        into table<Todo>
                        value newTodo
                    }
                    |> conn.InsertAsync

                return! Successful.CREATED { newTodo with Id = insertedId } next ctx
            }

    let update connectionString id : HttpHandler =
        fun (next: HttpFunc) (ctx: Microsoft.AspNetCore.Http.HttpContext) ->
            task {
                let! request = ctx.BindJsonAsync<CreateTodoRequest>()
                use conn = new MySqlConnection(connectionString)

                let updatedTodo =
                    { Id = id
                      Description = request.Description
                      Status = request.Status }

                let! result =
                    update {
                        for t in table<Todo> do
                            set updatedTodo
                            where (t.Id = id)
                    }
                    |> conn.UpdateAsync

                match result = 1 with
                | true -> return! Successful.OK updatedTodo next ctx
                | false -> return! RequestErrors.NOT_FOUND "Todo not found" next ctx
            }

    let delete connectionString id : HttpHandler =
        fun (next: HttpFunc) (ctx: Microsoft.AspNetCore.Http.HttpContext) ->
            task {
                use conn = new MySqlConnection(connectionString)

                let! _ =
                    delete {
                        for t in table<Todo> do
                            where (t.Id = id)
                    }
                    |> conn.DeleteAsync

                return! Successful.NO_CONTENT next ctx
            }

let handlers connectionString =
    choose
        [ GET >=> Handler.get connectionString
          POST >=> Handler.create connectionString
          routef "/%i" (fun id ->
              choose
                  [ PUT >=> Handler.update connectionString id
                    DELETE >=> Handler.delete connectionString id ]) ]
