package net.raphdf201

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.apache.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlin.time.Clock
import kotlin.time.ExperimentalTime

@OptIn(ExperimentalTime::class)
fun Application.configureSecurity() {
    val httpClient = HttpClient(Apache) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
            })
        }
    }

    authentication {
        oauth("auth-oauth-google") {
            urlProvider = { Constants.Auth.CALLBACK }
            providerLookup = {
                OAuthServerSettings.OAuth2ServerSettings(
                    Constants.Auth.NAME,
                    Constants.Auth.AUTHORIZE_URL,
                    Constants.Auth.ACCESS_TOKEN_URL,
                    HttpMethod.Post,
                    Constants.Auth.CLIENT_ID,
                    Constants.Auth.CLIENT_SECRET,
                    Constants.Auth.DEFAULT_SCOPES
                )
            }
            client = httpClient
        }
        oauth("auth-oauth-google-dev") {
            urlProvider = { Constants.Auth.CALLBACK + "/dev" }
            providerLookup = {
                OAuthServerSettings.OAuth2ServerSettings(
                    Constants.Auth.NAME,
                    Constants.Auth.AUTHORIZE_URL,
                    Constants.Auth.ACCESS_TOKEN_URL,
                    HttpMethod.Post,
                    Constants.Auth.CLIENT_ID,
                    Constants.Auth.CLIENT_SECRET,
                    Constants.Auth.DEFAULT_SCOPES
                )
            }
            client = httpClient
        }
    }

    routing {
        authenticate("auth-oauth-google") {
            get("/login") {}
            get("/callback") {
                val principal: OAuthAccessTokenResponse.OAuth2? = call.authentication.principal()
                if (principal != null) {
                    try {
                        // Fetch user info from Google
                        val userInfo = httpClient.get("https://www.googleapis.com/oauth2/v2/userinfo") {
                            headers {
                                append("Authorization", "Bearer ${principal.accessToken}")
                            }
                        }.body<GoogleUserInfo>()

                        call.sessions.set(
                            UserSession(
                                true,
                                principal.accessToken,
                                userInfo.id,
                                userInfo.name,
                                userInfo.picture
                            )
                        )

                        val u = db.getUser(userInfo.id)
                        if (u == null) db.createUser(ExposedUser(userInfo.id, userInfo.name, userInfo.picture))
                        call.respondRedirect(Constants.Static.FRONTEND)
                    } catch (e: Exception) {
                        call.respondRedirect(Constants.Static.FRONTEND)
                        log("Error at ${Clock.System.now()} : google login ${e.message} ${e.stackTrace}")
                    }
                } else {
                    call.respondRedirect(Constants.Static.FRONTEND)
                }
            }
        }
        authenticate("auth-oauth-google-dev") {
            get("/login/dev") {}
            get("/callback" + "/dev") {
                val principal: OAuthAccessTokenResponse.OAuth2? = call.authentication.principal()
                if (principal != null) {
                    try {
                        // Fetch user info from Google
                        val userInfo = httpClient.get("https://www.googleapis.com/oauth2/v2/userinfo") {
                            headers {
                                append("Authorization", "Bearer ${principal.accessToken}")
                            }
                        }.body<GoogleUserInfo>()

                        call.sessions.set(
                            UserSession(
                                true,
                                principal.accessToken,
                                userInfo.id,
                                userInfo.name,
                                userInfo.picture
                            )
                        )

                        val u = db.getUser(userInfo.id)
                        if (u == null) db.createUser(ExposedUser(userInfo.id, userInfo.name, userInfo.picture))
                        call.respondRedirect(Constants.Static.DEV_FRONTEND + "?auth=success")
                        return@get
                    } catch (e: Exception) {
                        log("Error at ${Clock.System.now()} : dev login ${e.message} ${e.stackTrace}")
                    }
                }
                call.respondRedirect(Constants.Static.DEV_FRONTEND + "?auth=failure")
            }
        }

        get("/logout") {
            call.sessions.clear<UserSession>()
            call.respondRedirect("/")
        }

        get("/user") {
            val session = call.sessions.get<UserSession>()
            if (session?.isLoggedIn == true) {
                if (
                    session.userId != null
                    && session.name != null
                    && session.pictureUrl != null
                ) call.respond(
                    ExposedUser(
                        session.userId,
                        session.name,
                        session.pictureUrl
                    )
                )
                else call.respond(HttpStatusCode.BadRequest)
            } else {
                call.respond(HttpStatusCode.Unauthorized)
            }
        }

        get("/pfp") {
            val session = call.sessions.get<UserSession>()
            if (session?.isLoggedIn == true) {
                if (session.pictureUrl != null) call.respondRedirect(session.pictureUrl)
                else call.respond(HttpStatusCode.BadRequest)
            } else {
                call.respond(HttpStatusCode.Unauthorized)
            }
        }

        get("/pfpLink") {
            val session = call.sessions.get<UserSession>()
            if (session?.isLoggedIn == true) {
                if (session.pictureUrl != null) call.respondText(session.pictureUrl)
                else call.respond(HttpStatusCode.BadRequest)
            } else {
                call.respond(HttpStatusCode.Unauthorized)
            }
        }
    }
}

@Serializable
data class UserSession(
    val isLoggedIn: Boolean = false,
    val accessToken: String? = null,
    val userId: String? = null,
    val name: String? = null,
    val pictureUrl: String? = null
)

@Serializable
data class GoogleUserInfo(
    val id: String,
    val name: String,
    val given_name: String? = null,
    val family_name: String? = null,
    val picture: String? = null,
)
