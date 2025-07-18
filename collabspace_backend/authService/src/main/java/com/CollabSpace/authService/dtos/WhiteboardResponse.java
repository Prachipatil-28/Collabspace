package com.CollabSpace.authService.dtos;


import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class WhiteboardResponse {
    private Map<String, Object> board;
}
