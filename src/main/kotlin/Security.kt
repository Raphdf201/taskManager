package net.raphdf201

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.apache.Apache
import io.ktor.client.request.get
import io.ktor.client.request.headers
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.OAuthAccessTokenResponse
import io.ktor.server.auth.OAuthServerSettings
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.authentication
import io.ktor.server.auth.oauth
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.sessions.Sessions
import io.ktor.server.sessions.clear
import io.ktor.server.sessions.cookie
import io.ktor.server.sessions.get
import io.ktor.server.sessions.sessions
import io.ktor.server.sessions.set
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
                    name = Constants.Auth.NAME,
                    authorizeUrl = Constants.Auth.AUTHORIZE_URL,
                    accessTokenUrl = Constants.Auth.ACCESS_TOKEN_URL,
                    requestMethod = HttpMethod.Post,
                    clientId = Constants.Auth.CLIENT_ID,
                    clientSecret = Constants.Auth.CLIENT_SECRET,
                    defaultScopes = Constants.Auth.DEFAULT_SCOPES
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
                        val userInfo: GoogleUserInfo = httpClient.get("https://www.googleapis.com/oauth2/v2/userinfo") {
                            headers {
                                append("Authorization", "Bearer ${principal.accessToken}")
                            }
                        }.body()

                        call.sessions.set(UserSession(
                            isLoggedIn = true,
                            accessToken = principal.accessToken,
                            userId = userInfo.id,
                            email = userInfo.email,
                            name = userInfo.name,
                            pictureUrl = userInfo.picture
                        ))
                        call.respondRedirect(Constants.AFTERLOGIN_REDIRECT)
                    } catch (e: Exception) {
                        call.respondRedirect("/login")
                        log("Error at ${Clock.System.now()} : ${e.message}")
                    }
                } else {
                    call.respondRedirect("/loginPage/loginPage.html")
                }
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
                    session.email != null
                    && session.name != null
                    && session.pictureUrl != null
                    ) call.respond(ExposedUserSend(
                    session.email,
                    session.name,
                    session.pictureUrl
                ))
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
    val email: String? = null,
    val name: String? = null,
    val pictureUrl: String? = null
)

@Serializable
data class GoogleUserInfo(
    val id: String,
    val email: String,
    val verified_email: Boolean? = null,
    val name: String? = null,
    val given_name: String? = null,
    val family_name: String? = null,
    val picture: String? = null,
    val locale: String? = null
)
