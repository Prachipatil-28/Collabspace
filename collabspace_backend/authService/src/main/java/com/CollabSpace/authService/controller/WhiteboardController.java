package com.CollabSpace.authService.controller;


import com.CollabSpace.authService.dtos.WhiteboardListResponse;
import com.CollabSpace.authService.dtos.WhiteboardRequest;
import com.CollabSpace.authService.dtos.WhiteboardResponse;
import com.CollabSpace.authService.service.WhiteboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/whiteboard")
public class WhiteboardController {

    @Autowired
    private WhiteboardService whiteboardService;

    @GetMapping("/{workspaceId}/list")
    public ResponseEntity<WhiteboardListResponse> listWhiteboards(@PathVariable String workspaceId) {
        WhiteboardListResponse response = whiteboardService.listWhiteboards(workspaceId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{workspaceId}/{boardName}")
    public ResponseEntity<WhiteboardResponse> getWhiteboard(@PathVariable String workspaceId, @PathVariable String boardName) {
        WhiteboardResponse response = whiteboardService.getWhiteboard(workspaceId, boardName);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/save")
    public ResponseEntity<WhiteboardResponse> saveWhiteboard(@RequestBody WhiteboardRequest request) {
        WhiteboardResponse response = whiteboardService.saveWhiteboard(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/delete")
    public ResponseEntity<Void> deleteWhiteboard(@RequestBody WhiteboardRequest request) {
        whiteboardService.deleteWhiteboard(request.getWorkspaceId(), request.getBoardName());
        return ResponseEntity.ok().build();
    }
}
