package si.fri.fog.services.authorization;

import si.fri.fog.pojo.Role;
import si.fri.fog.pojo.User;

import javax.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import si.fri.fog.services.authorization.IdentityManagement;

import javax.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import lombok.extern.slf4j.Slf4j;

import org.json.simple.parser.ParseException;

@Slf4j
@ApplicationScoped
public class UserService {

    List<User> usersAll = new ArrayList<User>();

    @Inject
    @RestClient
    IdentityManagement identityManagement;


    //TODO: Need information from identity management
    public List<User> getUsers(){

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

        

        for (int i = 0, size = json.size(); i < size; i++)
        {
                JSONObject tmpObject = (JSONObject) json.get(i);

                Role tmpRole = null;

                log.info("{}", tmpObject.get("userType"));

                int userTypeInt = Integer.parseInt(tmpObject.get("userType").toString());

                if(userTypeInt == 0){
                        tmpRole = Role.READER;
                }
                if(userTypeInt == 1){
                        tmpRole = Role.REVIEWER;
                }
                if(userTypeInt == 2){
                        tmpRole = Role.EDITOR;
                }
                if(userTypeInt == 3){
                        tmpRole = Role.AUTHOR;
                }

                User tmpUser = new User(String.valueOf(tmpObject.get("userAddres")), tmpRole);

                log.info("{}", tmpUser);

                usersAll.add(tmpUser);

        }

        /* return List.of(
                new User("magerl.zan@gmail.com", Role.AUTHOR),
                new User("buragev@student.uni-lj.si", Role.EDITOR),
                new User("buragev1@gmail.com", Role.REVIEWER),
                new User("jb5000@student.uni-lj.si", Role.AUTHOR),
                new User("0x6b1ab1fd76d471f7b65cdbe4198b72c2997476f8", Role.AUTHOR)
                
        );*/
        return usersAll;
    }

    public List<User> getEditors(){
        return this.getUsers().stream().filter(user -> user.getRole() == Role.EDITOR).collect(Collectors.toList());
    }

    public List<User> getReviewers() {
        //return this.getUsers().stream().filter(user -> user.getRole() == Role.REVIEWER).collect(Collectors.toList());
        log.info("{}", "in get revirws");
        if(this.usersAll.size() == 0){
                return this.getUsers().stream().filter(user -> user.getRole() == Role.REVIEWER).collect(Collectors.toList());
        }else{
                return this.usersAll.stream().filter(user -> user.getRole() == Role.REVIEWER).collect(Collectors.toList());
        }
        
    }

    public User getRandomEditor(){
        List<User> editors = getEditors();
        return editors.get(new Random().nextInt(editors.size()));
    }

    public User getRandomReviewer(){
        List<User> reviewers = getReviewers();
        return reviewers.get(new Random().nextInt(reviewers.size()));
    }

    public User getUser(String email){
        //
        log.info("{}", this.usersAll.size());
        if(this.usersAll.size() == 0){
                return this.getUsers().stream().filter(u -> u.getEmail().equals(email)).findFirst().get();
        }else{
                return this.usersAll.stream().filter(u -> u.getEmail().equals(email)).findFirst().get();
        }
        
    }

}
