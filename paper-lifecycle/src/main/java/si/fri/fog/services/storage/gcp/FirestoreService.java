package si.fri.fog.services.storage.gcp;

import com.google.api.client.util.Lists;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.extern.slf4j.Slf4j;
import si.fri.fog.pojo.Metadata;
import si.fri.fog.pojo.User;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Slf4j
@ApplicationScoped
public class FirestoreService {

    private static final String PROJECT_ID = "vast-gearing-355922";

    private static final String METADATA_COLLECTION = "metadata";

    private Firestore firestore;

    @PostConstruct
    public void init() {
        FirestoreOptions firestoreOptions =
                FirestoreOptions.getDefaultInstance().toBuilder()
                        .setProjectId(PROJECT_ID)
                        .build();
        firestore = firestoreOptions.getService();
    }

    public boolean addMetadata(Metadata metadata){
        ApiFuture<WriteResult> result = firestore.collection(METADATA_COLLECTION).document().set(metadata);
        try {
            log.info("Added metadata {} at time {}", metadata, result.get().getUpdateTime());
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error while saving new metadata to Firestore");
            throw new RuntimeException(e);
        }
        return true;
    }

    public Metadata getMetadata(String article){
        String documentId = getDocumentIdFromArticle(article);
        try {
            return firestore.collection(METADATA_COLLECTION).document(documentId).get().get().toObject(Metadata.class);
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    public List<String> getMetadataFilterByStatus(String status){
        var metadatas = firestore.collection(METADATA_COLLECTION);
        Query query = metadatas.whereEqualTo("stage", status);

        try {
            return query.get().get().getDocuments().stream().map(e -> (String)e.get("id")).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Metadata> getMetadata(){
        var documents = Lists.newArrayList(firestore.collection(METADATA_COLLECTION).listDocuments().iterator());
        return documents.stream().map(element -> {
            try {
                return element.get().get().toObject(Metadata.class);
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException(e);
            }
        }).collect(Collectors.toList());
    }
    

    public void updateMetadata(String id, Metadata metadata){
        String documentId = getDocumentIdFromArticle(id);
        Map<String, Object> data = new HashMap<>();
        data.put("user", metadata.getUser());
        data.put("submittedDate", metadata.getSubmittedDate());
        data.put("submission", metadata.getSubmission());
        data.put("revision", metadata.getRevision());
        data.put("stage", metadata.getStage());
        data.put("reviews", metadata.getReviews());
        data.put("title", metadata.getTitle());
        data.put("cid", metadata.getCid());

        firestore.collection(METADATA_COLLECTION).document(documentId).update(data);
    }

    public List<String> getArticlesFromUser(User user){
        var metadatas = firestore.collection(METADATA_COLLECTION);
        Query query = metadatas.whereEqualTo("user", user.getEmail());

        try {
            return query.get().get().getDocuments().stream().map(e -> (String)e.get("id")).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    public List<String> getArticlesFromUserAccepted(User user){
        var metadatas = firestore.collection(METADATA_COLLECTION);
        Query query = metadatas.whereEqualTo("user", user.getEmail()).whereEqualTo("stage", "ACCEPTED");

        try {
            return query.get().get().getDocuments().stream().map(e -> (String)e.get("id")).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    public List<String> getArticlesFromUserRejected(User user){
        var metadatas = firestore.collection(METADATA_COLLECTION);
        Query query = metadatas.whereEqualTo("user", user.getEmail()).whereEqualTo("stage", "REJECTED");

        try {
            return query.get().get().getDocuments().stream().map(e -> (String)e.get("id")).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }
    

    public List<String> getArticlesFromUserSubmitted(User user){
        var metadatas = firestore.collection(METADATA_COLLECTION);
        Query query = metadatas.whereEqualTo("user", user.getEmail()).whereEqualTo("stage", "SUBMITTED");

        try {
            return query.get().get().getDocuments().stream().map(e -> (String)e.get("id")).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    private String getDocumentIdFromArticle(String id) {
        var metadatas = firestore.collection(METADATA_COLLECTION);
        Query query = metadatas.whereEqualTo("id", id);

        try {
            var documents = query.get().get().getDocuments();
            if (documents.size() > 1){
                throw new RuntimeException("For given query for article " + id +  " there is more than just one document");
            }
            else if (documents.size() == 0){
                throw new RuntimeException("For given query for article " + id + " there is no records.");
            }
            return documents.get(0).getId();

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }
}
