package si.fri.fog.services.authorization;

import si.fri.fog.pojo.Role;
import si.fri.fog.pojo.User;

import javax.enterprise.context.ApplicationScoped;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService {

    //TODO: Need information from identity management
    public List<User> getUsers(){
        return List.of(
                new User("magerl.zan@gmail.com", Role.AUTHOR),
                new User("buragev@student.uni-lj.si", Role.EDITOR),
                new User("buragev1@gmail.com", Role.REVIEWER),
                new User("jb5000@student.uni-lj.si", Role.AUTHOR),
                new User("0x6b1ab1fd76d471f7b65cdbe4198b72c2997476f8", Role.AUTHOR)
                
        );
    }

    public List<User> getEditors(){
        return this.getUsers().stream().filter(user -> user.getRole() == Role.EDITOR).collect(Collectors.toList());
    }

    public List<User> getReviewers() {
        return this.getUsers().stream().filter(user -> user.getRole() == Role.REVIEWER).collect(Collectors.toList());
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
        return getUsers().stream().filter(u -> u.getEmail().equals(email)).findFirst().get();
    }
}
