import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractQueryTokens,
  scoreMemoryItem,
  searchAndRankMemories,
  synthesizeVaultAnswer,
} from '../src/lib/memory-search';
import type { MemoryItem } from '../src/lib/data';

const SAMPLE_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'Deep Work: Rules for Focused Success',
    summary: 'Cal Newport argues that the ability to focus without distraction on cognitively demanding tasks is becoming increasingly rare and valuable.',
    content: 'Deep work is the ability to focus without distraction on a cognitively demanding task. Four rules: work deeply, embrace boredom, quit social media, drain the shallows.',
    url: 'https://calnewport.com/books/deep-work/',
    type: 'note',
    tags: ['Productivity', 'Focus', 'Books'],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
    isFavorite: true,
  },
  {
    id: 'mem-2',
    title: 'Huberman Lab: Optimal Morning Routine',
    summary: 'Protocol for high energy and focus: morning sunlight within 30-60 minutes of waking, delay caffeine 90-120 minutes, cold exposure, zone 2 cardio.',
    content: 'Full morning sunlight viewing triggers dopamine and cortisol pulse. Delaying caffeine prevents afternoon crash. Hydrate with electrolytes.',
    url: 'https://hubermanlab.com/routine',
    type: 'link',
    tags: ['Health', 'Routine', 'Science'],
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-02T10:00:00Z',
    isFavorite: false,
  },
  {
    id: 'mem-3',
    title: 'Vibe Coding with Cursor & Claude 3.5 Sonnet',
    summary: 'Prompt-driven programming guide: build fullstack apps at the speed of thought by using AI for scaffolding and refactoring.',
    content: 'Cursor editor with Claude 3.5 Sonnet enables rapid vibe coding workflows. Compose system prompts and let agents generate components.',
    url: 'https://cursor.com',
    type: 'link',
    tags: ['Vibe Coding', 'AI Coding', 'Tools'],
    createdAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-03T10:00:00Z',
    isFavorite: true,
  },
  {
    id: 'mem-4',
    title: 'Awesome Machine Learning & Generative AI Resources',
    summary: 'Curated list of generative AI models, transformer architectures, vector databases, and LLM fine-tuning techniques.',
    content: 'Comprehensive list of AI frameworks, PyTorch tutorials, Hugging Face transformers, and neural retrieval pipelines.',
    url: 'https://github.com/josephmisiti/awesome-machine-learning',
    type: 'link',
    tags: ['AI', 'Machine Learning', 'Open Source'],
    createdAt: '2026-03-04T10:00:00Z',
    updatedAt: '2026-03-04T10:00:00Z',
    isFavorite: false,
  },
];

describe('Search and Ask AI Memory Suite', () => {
  test('extractQueryTokens strips conversational stop words', () => {
    const { rawTokens, meaningfulTokens } = extractQueryTokens('what did I save about deep work and morning routine?');
    assert.deepEqual(meaningfulTokens, ['deep', 'work', 'morning', 'routine']);
    assert.ok(rawTokens.includes('what'));
    assert.ok(rawTokens.includes('did'));
  });

  test('extractQueryTokens handles empty and punctuation strings safely', () => {
    const emptyRes = extractQueryTokens('');
    assert.deepEqual(emptyRes.rawTokens, []);
    assert.deepEqual(emptyRes.meaningfulTokens, []);

    const punctRes = extractQueryTokens('??? !!! ...');
    assert.deepEqual(punctRes.rawTokens, []);
  });

  test('scoreMemoryItem is resilient against undefined/null fields', () => {
    const incompleteItem = {
      id: 'incomplete-1',
      title: undefined as unknown as string,
      summary: undefined as unknown as string,
      content: undefined as unknown as string,
      tags: null as unknown as string[],
      url: undefined,
      type: undefined as unknown as 'link',
      createdAt: '',
      updatedAt: '',
    };

    assert.doesNotThrow(() => {
      const score = scoreMemoryItem(incompleteItem, 'test query', ['test', 'query']);
      assert.equal(score, 0);
    });
  });

  test('searchAndRankMemories resolves preset suggestion "AI and machine learning resources"', () => {
    const results = searchAndRankMemories(SAMPLE_MEMORIES, 'AI and machine learning resources');
    assert.ok(results.length >= 1, 'Should find at least 1 memory for AI resources');
    assert.equal(results[0].id, 'mem-4');
  });

  test('searchAndRankMemories resolves conversational question "what did I save about deep work"', () => {
    const results = searchAndRankMemories(SAMPLE_MEMORIES, 'what did I save about deep work');
    assert.ok(results.length >= 1, 'Should find memory for deep work');
    assert.equal(results[0].id, 'mem-1');
  });

  test('searchAndRankMemories finds vibe coding memories via tag and keyword', () => {
    const results = searchAndRankMemories(SAMPLE_MEMORIES, 'vibe coding');
    assert.ok(results.length >= 1);
    assert.equal(results[0].id, 'mem-3');
  });

  test('synthesizeVaultAnswer generates cited answer for natural questions', () => {
    const matched = searchAndRankMemories(SAMPLE_MEMORIES, 'how to optimize morning routine?');
    assert.ok(matched.length >= 1);

    const answer = synthesizeVaultAnswer('how to optimize morning routine?', matched);
    assert.ok(answer, 'Answer must not be null');
    assert.equal(answer.isQuestion, true);
    assert.ok(answer.answer.includes('morning sunlight'));
    assert.ok(answer.citations.length >= 1);
    assert.equal(answer.citations[0].id, 'mem-2');
  });

  test('synthesizeVaultAnswer returns null when query is blank or no items match', () => {
    assert.equal(synthesizeVaultAnswer('', []), null);
    assert.equal(synthesizeVaultAnswer('non-matching nonexistent string', []), null);
  });
});
