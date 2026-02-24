package net.raphdf201

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import org.jetbrains.exposed.v1.jdbc.Database

lateinit var db: DatabaseService

fun Application.configureDatabases() {
    db = DatabaseService(
        Database.connect(
            Constants.Database.URL,
            Constants.Database.DRIVER,
            Constants.Database.USER,
            Constants.Database.PASSWORD,
        )
    )

    routing {
        get("/") {
            call.respondRedirect(Constants.Static.FRONTEND)
        }

        route("/tasks") {
            get {
                call.authorizedActionWithMessage {
                    db.getTasks()
                }
            }

            post<ExposedTaskReceive> {
                call.authorizedActionWithMessage(HttpStatusCode.Created) {
                    db.createTask(call.receive())
                }
            }

            get("/{id}") {
                val task = db.getTask(call.parameters["id"]?.toInt())
                if (task != null) call.respond(task)
                else call.respond(HttpStatusCode.NotFound)
            }

            put<ExposedTaskReceive>("/{id}") {
                call.authorizedAction(HttpStatusCode.NoContent) {
                    db.updateTask(
                        call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID"),
                        call.receive()
                    )
                }
            }

            delete("/{id}") {
                call.authorizedAction(HttpStatusCode.NoContent) {
                    db.deleteTask(call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID"))
                }
            }
        }

        route("/users") {
            get {
                call.authorizedActionWithMessage {
                    db.getUsers()
                }
            }

            get("/{id}") {
                val user = db.getUser(call.parameters["id"])
                if (user != null) call.respond(user)
                else call.respond(HttpStatusCode.NotFound)
            }

            put<ExposedUser>("/{id}") {
                call.authorizedAction(HttpStatusCode.NoContent) {
                    db.updateUser(call.parameters["id"], call.receive())
                }
            }

            delete("/{id}") {
                call.authorizedAction(HttpStatusCode.NoContent) {
                    db.deleteUser(call.parameters["id"])
                }
            }
        }

        get("/isLoggedIn") {
            call.respond(if (call.isLoggedIn()) HttpStatusCode.OK else HttpStatusCode.Unauthorized)
        }
    }
}
