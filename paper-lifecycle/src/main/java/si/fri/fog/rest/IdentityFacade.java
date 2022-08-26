package si.fri.fog.rest;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import lombok.extern.slf4j.Slf4j;

import si.fri.fog.pojo.integrations.IMUser;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import si.fri.fog.services.authorization.IdentityManagement;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import si.fri.fog.pojo.Role;
import si.fri.fog.pojo.User;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Path("/userManagment")
public class IdentityFacade {

    @Inject
    @RestClient
    IdentityManagement identityManagement;

    @Inject
    @ConfigProperty(name = "authority.WalletPk") 
    String walletPk;

    @Inject
    @ConfigProperty(name = "authority.provider") 
    String provider;
    

    @POST
    @Path("/create")
    //@Consumes(MediaType.APPLICATION_JSON)
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
    public Response createUser(){
    //public Response createUser(IMUser properties){  --- Old way with json parameter
        
        IMUser properties = new IMUser();

        properties.provider = this.provider;
        properties.walletPk = this.walletPk;

        log.info("{}", properties.provider);

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

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("getAllUsers")
    @Operation(summary = "Get all users", description = "Get all users from identity managment microservice")
    @APIResponses({
            @APIResponse(
                    responseCode = "200",
                    description = "Successfully retrieved users"
            ),
            @APIResponse(
                    responseCode = "400",
                    description = "Something went wrong with retrieving users"
            )
    })

    public Response getAllUsers(){


        String allUsersJsonString = identityManagement.getAllUsers();
        
        JSONParser parser = new JSONParser();  
        JSONArray json = new JSONArray();

        try {
                json = (JSONArray) parser.parse(allUsersJsonString);
        } catch (ParseException e) {
                // TODO Auto-generated catch block
                json = null;
                e.printStackTrace();
        }  


        List<User> usersAll = new ArrayList<User>();

        for (int i = 0, size = json.size(); i < size; i++)
        {
                JSONObject tmpObject = (JSONObject) json.get(i);

                Role tmpRole = null;

                log.info("{}", tmpObject.get("userType"));

                if(Integer.parseInt(tmpObject.get("userType").toString()) == 0){
                        tmpRole = Role.READER;
                }
                if(Integer.parseInt(tmpObject.get("userType").toString()) == 1){
                        tmpRole = Role.REVIEWER;
                }
                if(Integer.parseInt(tmpObject.get("userType").toString()) == 2){
                        tmpRole = Role.EDITOR;
                }
                if(Integer.parseInt(tmpObject.get("userType").toString()) == 3){
                        tmpRole = Role.AUTHOR;
                }

                User tmpUser = new User(String.valueOf(tmpObject.get("userAddres")), tmpRole);

                log.info("{}", tmpUser);

                usersAll.add(tmpUser);

        }

        log.info("{}", usersAll);

        return Response.ok().entity("").build();
    }

    

}
