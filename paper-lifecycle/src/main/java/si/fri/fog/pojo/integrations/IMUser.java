package si.fri.fog.pojo.integrations;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class IMUser {
    
    @JsonProperty("wallet_pk")
    public String walletPk;
    @JsonProperty("provider")
    public String provider;
}
