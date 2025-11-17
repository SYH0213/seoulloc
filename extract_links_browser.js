// 브라우저 콘솔(F12)에서 실행하세요
// https://ms.smc.seoul.kr/kr/assembly/session.do 페이지에서

(async function() {
    console.log('제332회 회의록 링크 추출 시작...');

    // 1. 제11대 찾아서 펼치기
    const th11Nodes = Array.from(document.querySelectorAll('span.fancytree-title'))
        .filter(el => el.textContent.includes('제11대'));

    if (th11Nodes.length > 0) {
        const th11 = th11Nodes[0];
        console.log('제11대 발견:', th11.textContent);

        const expanderTh11 = th11.parentElement.querySelector('span.fancytree-expander');
        if (expanderTh11) {
            expanderTh11.click();
            console.log('제11대 펼침');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // 2. 제332회 찾아서 펼치기
    const session332Nodes = Array.from(document.querySelectorAll('span.fancytree-title'))
        .filter(el => el.textContent.includes('제332회') && el.textContent.includes('임시회'));

    if (session332Nodes.length > 0) {
        const session332 = session332Nodes[0];
        console.log('제332회 발견:', session332.textContent);

        // 스크롤해서 보이게
        session332.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(resolve => setTimeout(resolve, 1000));

        const expanderSession = session332.parentElement.querySelector('span.fancytree-expander');
        if (expanderSession) {
            expanderSession.click();
            console.log('제332회 펼침');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 3. 1차 위원회 폴더 펼치기 (본회의, 운영위원회 등)
        const sessionLi = session332.closest('li');
        await new Promise(resolve => setTimeout(resolve, 1000));

        let level1Folders = Array.from(sessionLi.querySelectorAll(':scope > ul > li.fancytree-folder'));
        console.log(`1차 위원회 폴더 ${level1Folders.length}개 발견`);

        for (let i = 0; i < level1Folders.length; i++) {
            const folder = level1Folders[i];
            const title = folder.querySelector('span.fancytree-title');
            const expander = folder.querySelector('span.fancytree-expander');

            if (expander && title && !folder.classList.contains('fancytree-expanded')) {
                console.log(`  ${i + 1}. ${title.textContent} 펼치기`);
                folder.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await new Promise(resolve => setTimeout(resolve, 300));
                expander.click();
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }

        console.log('1차 폴더 펼침 완료');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. 2차 폴더도 펼치기 (각 위원회의 회차별 폴더)
        const level2Folders = Array.from(sessionLi.querySelectorAll('li.fancytree-folder'));
        console.log(`전체 폴더 ${level2Folders.length}개 발견 (2차 폴더 포함)`);

        for (let i = 0; i < level2Folders.length; i++) {
            const folder = level2Folders[i];
            const expander = folder.querySelector('span.fancytree-expander');

            if (expander && !folder.classList.contains('fancytree-expanded')) {
                folder.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await new Promise(resolve => setTimeout(resolve, 200));
                expander.click();
                await new Promise(resolve => setTimeout(resolve, 400));
            }
        }

        console.log('모든 하위 폴더 펼침 완료');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 5. 링크 추출
        const links = Array.from(sessionLi.querySelectorAll('a[href*="recordView.do"]'));

        console.log(`\n총 ${links.length}개 회의록 링크 발견\n`);

        const urls = links.map(link => link.href).filter(url => url);
        const details = links.map(link => ({
            title: link.textContent.trim(),
            url: link.href
        }));

        // 결과 출력
        console.log('='.repeat(80));
        console.log('추출된 URL 목록:');
        console.log('='.repeat(80));
        urls.forEach(url => console.log(url));

        console.log('\n\n='.repeat(80));
        console.log('상세 정보:');
        console.log('='.repeat(80));
        details.forEach(d => {
            console.log(`제목: ${d.title}`);
            console.log(`URL: ${d.url}`);
            console.log('');
        });

        // 클립보드에 복사 (URL만)
        const urlText = urls.join('\n');
        copy(urlText);
        console.log('✓ URL이 클립보드에 복사되었습니다!');

        return { urls, details };

    } else {
        console.log('제332회를 찾을 수 없습니다.');

        // 모든 회기 목록 출력
        const allSessions = Array.from(document.querySelectorAll('span.fancytree-title'))
            .map(el => el.textContent.trim())
            .filter(text => text.includes('회'));

        console.log('발견된 회기 목록:');
        allSessions.forEach(s => console.log(s));
    }
})();
