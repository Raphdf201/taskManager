package net.raphdf201

import io.ktor.server.application.Application
import io.ktor.server.netty.EngineMain

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    configureDatabases()
    configureSecurity()
    configureHTTP()
    configureRouting()
}
