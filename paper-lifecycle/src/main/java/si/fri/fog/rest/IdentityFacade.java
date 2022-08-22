package si.fri.fog.rest;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;

import org.json.simple.JSONObject;

import lombok.extern.slf4j.Slf4j;

import si.fri.fog.pojo.integrations.IMUser;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import si.fri.fog.services.authorization.IdentityManagement;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Slf4j
@Path("/userManagment")
public class IdentityFacade {

    @Inject
    @RestClient
    IdentityManagement identityManagement;

    @POST
    @Path("/create")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Create new user", description = "Create new user in identity managment")
    @APIResponses({
            @APIResponse(
                    responseCode = "200",
                    description = "Successfully created user"
            ),
            @APIResponse(
                    responseCode = "400",
                    description = "Something went wrong with creating the user"
            )
    })
    public Response createUser(IMUser properties){

        log.info("{}", properties.walletPk);

        String response = identityManagement.createUser(properties);
        log.info("{}", response);

            return Response.ok().entity(response).build();
        

    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("getUserMetadata/{provider}/{address}")
    @Operation(summary = "Get user metadata", description = "Get user metadata for given contract adress")
    @APIResponses({
            @APIResponse(
                    responseCode = "200",
                    description = "Successfully retrieved user"
            ),
            @APIResponse(
                    responseCode = "400",
                    description = "Something went wrong with retrieving user data"
            )
    })

    public Response getUserData(@PathParam("provider") String provider,@PathParam("address") String address){

        String userData = identityManagement.getUserMetadata(provider, address);
        
        log.info("{}", userData);

        return Response.ok().entity(userData).build();
    }

}
