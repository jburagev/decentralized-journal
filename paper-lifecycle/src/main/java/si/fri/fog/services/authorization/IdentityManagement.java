package si.fri.fog.services.authorization;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import si.fri.fog.pojo.User;
import si.fri.fog.pojo.integrations.IMUser;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

import javax.ws.rs.*;

import org.json.simple.JSONObject;

import com.fasterxml.jackson.annotation.JsonProperty;

@ApplicationScoped
@RegisterRestClient(baseUri = "http://localhost:8083/")
public interface IdentityManagement {


    @GET
    @Path("read/{provider}/{address}")
    String getUserMetadata(@PathParam("provider") String provider,@PathParam("address") String address);

    @Path("/editor")
    User getEditors();

    @POST
    @Path("/create")
    String createUser(IMUser properties);


}
