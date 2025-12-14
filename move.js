const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
const successPath = path.join(__dirname, 'success.txt');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Identify Resume Section
    const resumeStartMarker = '<section class="ftco-section ftco-no-pb" id="resume-section">';
    const resumeStartIndex = content.indexOf(resumeStartMarker);
    
    if (resumeStartIndex === -1) {
        throw new Error('Resume section not found');
    }
    
    // Find the end of the resume section. 
    // It should be the first </section> after the start marker.
    const resumeEndMarker = '</section>';
    const resumeEndIndex = content.indexOf(resumeEndMarker, resumeStartIndex);
    
    if (resumeEndIndex === -1) {
        throw new Error('Resume section end not found');
    }
    
    // Include the shutting tag text length
    const resumeFullEndIndex = resumeEndIndex + resumeEndMarker.length;
    
    // Extract the section block
    const resumeSection = content.substring(resumeStartIndex, resumeFullEndIndex);
    
    // Identify Project Section
    const projectStartMarker = '<section class="ftco-section" id="project-section">';
    const projectStartIndex = content.indexOf(projectStartMarker);
    
    if (projectStartIndex === -1) {
        throw new Error('Project section not found');
    }
    
    // Logic:
    // Remove Resume Section first? 
    // Resume is currently AFTER Project?
    // Let's check the indices.
    console.log('Resume Start:', resumeStartIndex);
    console.log('Project Start:', projectStartIndex);
    
    let newContent = content;
    
    if (resumeStartIndex > projectStartIndex) {
        // Resume is AFTER Project.
        // We need to remove Resume, then insert it BEFORE Project.
        
        // Remove Resume
        // Helper to remove a range
        const part1 = content.substring(0, resumeStartIndex);
        const part2 = content.substring(resumeFullEndIndex);
        
        // Intermediate content
        const contentWithoutResume = part1 + part2;
        
        // Now find Project Start again (it should be same index if nothing before it changed)
        // Since we removed something AFTER it, the index of Project Start is unchanged.
        
        const projectIndexInNew = contentWithoutResume.indexOf(projectStartMarker);
        
        // Insert Resume before Project
        const finalPart1 = contentWithoutResume.substring(0, projectIndexInNew);
        const finalPart2 = contentWithoutResume.substring(projectIndexInNew);
        
        // Add some spacing
        newContent = finalPart1 + resumeSection + '\n\n' + finalPart2;
        
    } else {
        // Resume is BEFORE Project ?? (Already moved?)
        console.log("Resume is already before Project or logic error.");
        // If it's already before, we might not need to do anything, 
        // OR we need to be careful. 
        // The user want Resume ABOVE Project. 
        // If resumeStartIndex < projectStartIndex, it IS above.
        // But let's assume it's below as per previous observations.
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    fs.writeFileSync(successPath, 'Moved successfully', 'utf8');
    console.log('Done');

} catch (err) {
    console.error(err);
    fs.writeFileSync(successPath, 'Error: ' + err.message, 'utf8');
}
