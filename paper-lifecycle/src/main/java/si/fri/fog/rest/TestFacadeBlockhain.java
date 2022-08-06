package si.fri.fog.rest;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import si.fri.fog.services.web3.BlockchainTest;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.IOException;

@Path("/testBlockchain")
public class TestFacadeBlockhain {

    private BlockchainTest blockchainEventListener = new BlockchainTest();


    @GET
    @Path("/call")
    @Operation(summary = "call a function", description = "calling a function")
    @APIResponses({
            @APIResponse(
                    responseCode = "200",
                    description = "Successfully connected to blockchain"
            )
    })
    public Response callFunction() throws IOException {
        blockchainEventListener.callFunction();
        return Response.ok().build();
    }
}
