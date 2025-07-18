// package com.CollabSpace.authService.dtos;
package com.CollabSpace.authService.dtos;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CodeProjectDto {
    private Long id;
    private String workspaceId;
    private List<FileDto> files;
    private String code;
    private String language;
    private String owner;
    private LocalDateTime createdAt;

    @AllArgsConstructor
    @NoArgsConstructor
    @Setter
    @Getter
    @Builder
    public static class FileDto {
        private String name;
        private String content;

    }
}