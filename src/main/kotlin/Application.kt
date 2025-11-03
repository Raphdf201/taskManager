package net.raphdf201

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.netty.EngineMain
import io.ktor.server.response.respond
import io.ktor.server.routing.RoutingCall
import io.ktor.server.sessions.get
import io.ktor.server.sessions.sessions

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    configureDatabases()
    configureSecurity()
    configureHTTP()
}

fun RoutingCall.isLoggedIn(): Boolean {
    return this.sessions.get<UserSession>()?.isLoggedIn ?: false
}

suspend fun RoutingCall.authorizedAction(successCode: HttpStatusCode = HttpStatusCode.OK, action: suspend () -> Unit) {
    if (this.isLoggedIn()) {
        action()
        this.respond(successCode)
    } else this.respond(HttpStatusCode.Unauthorized)
}

suspend fun RoutingCall.authorizedAction(successCode: HttpStatusCode = HttpStatusCode.OK, message: Any, action: suspend () -> Unit) {
    if (this.isLoggedIn()) {
        action()
        this.respond(successCode, message)
    } else this.respond(HttpStatusCode.Unauthorized)
}

suspend fun RoutingCall.authorizedActionWithMessage(successCode: HttpStatusCode = HttpStatusCode.OK, action: suspend () -> Any) {
    if (this.isLoggedIn()) {
        this.respond(successCode, action())
    } else this.respond(HttpStatusCode.Unauthorized)
}
