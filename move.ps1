$path = "index.html"
$content = Get-Content -Path $path -Raw -Encoding UTF8

$resumeMarker = '<section class="ftco-section ftco-no-pb" id="resume-section">'
$resumeStart = $content.IndexOf($resumeMarker)

if ($resumeStart -eq -1) {
    Write-Host "Resume section not found"
    exit 1
}

$resumeEndMarker = '</section>'
# Start looking for end marker after start
# We need to find the correct closing tag.
# We know Resume section (from view_file) doesn't have nested sections, 
# so the first </section> after start should be it.

$resumeEnd = $content.IndexOf($resumeEndMarker, $resumeStart)

if ($resumeEnd -eq -1) {
    Write-Host "Resume section end not found"
    exit 1
}

$resumeEnd += $resumeEndMarker.Length

$resumeSection = $content.Substring($resumeStart, $resumeEnd - $resumeStart)

$projectMarker = '<section class="ftco-section" id="project-section">'
$projectStart = $content.IndexOf($projectMarker)

if ($projectStart -eq -1) {
    Write-Host "Project section not found"
    exit 1
}

# Check if Resume is after Project
if ($resumeStart -gt $projectStart) {
    # Remove Resume
    # To be safe, we split string
    $part1 = $content.Substring(0, $resumeStart)
    $part2 = $content.Substring($resumeEnd)
    $contentNoResume = $part1 + $part2
    
    # Recalculate Project Start in new content
    # Since Resume was AFTER, Project Start index is same? 
    # Yes.
    
    # Insert Resume
    $finalPart1 = $contentNoResume.Substring(0, $projectStart)
    $finalPart2 = $contentNoResume.Substring($projectStart)
    
    $newContent = $finalPart1 + $resumeSection + "`n`n" + $finalPart2
    
    Set-Content -Path $path -Value $newContent -Encoding UTF8
    Write-Host "Success"
} else {
    Write-Host "Resume is already before Project"
}
