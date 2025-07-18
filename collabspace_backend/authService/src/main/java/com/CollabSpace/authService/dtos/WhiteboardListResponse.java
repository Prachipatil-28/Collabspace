package com.CollabSpace.authService.dtos;


import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class WhiteboardListResponse {
    private List<String> boards;
}
